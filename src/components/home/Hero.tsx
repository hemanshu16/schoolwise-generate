
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeroProps {
  className?: string;
}

const Hero = ({ className }: HeroProps) => {
  return (
    <div className={cn("site-hero min-h-[500px] flex flex-col justify-center", className)}>
      {/* Wave pattern overlay */}
      <svg className="wave-pattern" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
        <path 
          fill="hsl(171, 70%, 50%)" 
          fillOpacity="0.4" 
          d="M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,154.7C672,128,768,96,864,106.7C960,117,1056,171,1152,186.7C1248,203,1344,181,1392,170.7L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z">
        </path>
      </svg>

      <div className="container relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-secondary mb-4">Start Your Journey With Sitara Akka Today</h1>
          <p className="text-xl text-secondary/80 mb-8">Neevu 10th standard nalli iddre, here's all you need to know!</p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-6 h-auto text-lg">
            Join Sitara Champions Program
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
