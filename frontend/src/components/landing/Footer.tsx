import Link from "next/link"

export function Footer() {
  return (
    <footer className="pt-12 pb-24">      
      <div className="md:h-[512px] h-[610px] p-4 relative rounded-[35px] border border-[#E6E6E6] overflow-hidden bg-[radial-gradient(circle_at_center,#e6e6e6_1px,transparent_1px)] bg-[length:10px_10px]">
        {/* Radial Grid Background */}
        <div
          className="absolute -z-20 top-0 left-0 w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle, #e6e6e6 1px, transparent 1px)',
            backgroundSize: '10px 10px',
          }}
        />
        
        <div className="container mx-auto px-6 py-12">
          <h1 className="text-xl md:text-2xl font-bold text-primary mb-8">Somleng</h1>
          
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              <p className="text-muted-foreground">
                Khmer speech recognition and processing tool for researchers and language enthusiasts.
              </p>
            </div>
            
            <div className="md:w-2/3 flex justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-4">Pages</h3>
                <ul className="space-y-3">
                  <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary">Dashboard</Link></li>
                  <li><Link href="/features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                  <li><Link href="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                  <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4">Legal</h3>
                <ul className="space-y-3">
                  <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                  <li><Link href="/cookies" className="text-muted-foreground hover:text-primary">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-12 pt-8 flex justify-between">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Khmer Speech Tool. All rights reserved.
            </p>
          </div>
        </div>
        
        {/* Right Floating Khmer Text */}
        <div className="hidden md:flex rotate-[-12deg] absolute bottom-10 right-10 p-6 w-32 h-32 bg-white/80 backdrop-blur-sm rounded-md shadow-lg items-center justify-center text-2xl italic text-black-800">
          ក ខ គ
        </div>
      </div>
    </footer>
  )
} 