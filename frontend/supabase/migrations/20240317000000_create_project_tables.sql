-- Create enum for project status
create type project_status as enum ('draft', 'in_progress', 'completed', 'archived');

-- Create enum for audio processing status
create type processing_status as enum ('pending', 'processing', 'completed', 'failed');

-- Create projects table
create table if not exists projects (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    status project_status default 'draft',
    progress integer default 0,
    total_files integer default 0,
    total_size bigint default 0, -- in bytes
    total_duration integer default 0, -- in seconds
    dataset_path text, -- Path to the dataset in Supabase Storage
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) on delete cascade not null
);

-- Create audio_files table for project resources
create table if not exists audio_files (
    id uuid default gen_random_uuid() primary key,
    project_id uuid references projects(id) on delete cascade not null,
    file_name text not null,
    file_path text not null, -- Path in Supabase Storage
    file_size bigint not null, -- in bytes
    duration integer, -- duration in seconds
    sample_rate integer, -- in Hz
    channels integer, -- 1 for mono, 2 for stereo
    bit_depth integer, -- audio bit depth
    format text, -- audio format (wav, mp3, etc.)
    transcription_status processing_status default 'pending',
    transcription_content text, -- Store transcription directly with audio file
    confidence float, -- ASR confidence score
    error_message text, -- Store any processing errors
    processing_started_at timestamp with time zone,
    processing_completed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    created_by uuid references auth.users(id) on delete cascade not null
);

-- Create processing_logs table for tracking operations
create table if not exists processing_logs (
    id uuid default gen_random_uuid() primary key,
    audio_file_id uuid references audio_files(id) on delete cascade not null,
    operation text not null, -- e.g., 'transcription', 'noise_reduction'
    status processing_status not null,
    message text,
    started_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone,
    created_by uuid references auth.users(id) on delete cascade not null
);

-- Enable RLS (Row Level Security)
alter table projects enable row level security;
alter table audio_files enable row level security;
alter table processing_logs enable row level security;

-- Create policies
-- Projects policies
create policy "Users can view their own projects"
    on projects for select
    using (auth.uid() = created_by);

create policy "Users can create projects"
    on projects for insert
    with check (
        auth.uid() = created_by 
        and (
            select count(*) from projects 
            where created_by = auth.uid()
        ) < 3 -- Limit to 3 projects per user
    );

create policy "Users can update their own projects"
    on projects for update
    using (auth.uid() = created_by);

create policy "Users can delete their own projects"
    on projects for delete
    using (auth.uid() = created_by);

-- Audio files policies
create policy "Users can view their project audio files"
    on audio_files for select
    using (auth.uid() in (
        select created_by from projects where id = audio_files.project_id
    ));

create policy "Users can create audio files in their projects"
    on audio_files for insert
    with check (auth.uid() in (
        select created_by from projects where id = audio_files.project_id
    ));

-- Processing logs policies
create policy "Users can view their processing logs"
    on processing_logs for select
    using (auth.uid() in (
        select created_by from audio_files where id = processing_logs.audio_file_id
    ));

-- Create functions for updating project stats
create or replace function update_project_stats()
returns trigger as $$
begin
    if (tg_op = 'INSERT') then
        update projects
        set 
            total_files = total_files + 1,
            total_size = total_size + new.file_size,
            total_duration = total_duration + coalesce(new.duration, 0)
        where id = new.project_id;
    elsif (tg_op = 'DELETE') then
        update projects
        set 
            total_files = total_files - 1,
            total_size = total_size - old.file_size,
            total_duration = total_duration - coalesce(old.duration, 0)
        where id = old.project_id;
    elsif (tg_op = 'UPDATE') then
        -- Only update if file_size or duration changed
        if (new.file_size != old.file_size or new.duration != old.duration) then
            update projects
            set 
                total_size = total_size - old.file_size + new.file_size,
                total_duration = total_duration - coalesce(old.duration, 0) + coalesce(new.duration, 0)
            where id = new.project_id;
        end if;
    end if;
    return null;
end;
$$ language plpgsql;

-- Create function for updating timestamps
create or replace function update_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers
create trigger projects_updated_at
    before update on projects
    for each row
    execute function update_updated_at();

create trigger audio_files_updated_at
    before update on audio_files
    for each row
    execute function update_updated_at();

create trigger update_project_stats_on_file_change
    after insert or update or delete on audio_files
    for each row
    execute function update_project_stats(); 