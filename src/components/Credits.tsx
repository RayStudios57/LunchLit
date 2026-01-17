import { Heart, Code, ChevronDown, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Credits() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="card-elevated p-3">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors">
            <div className="flex items-center gap-2">
              <Code className="h-3 w-3" />
              <span>LunchLit © {new Date().getFullYear()}</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 animate-accordion-down">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 fill-red-500 animate-pulse" />
            <span>by</span>
          </div>
          <div className="text-center mt-2">
            <p className="font-semibold text-foreground">Ramakrishna Krishna</p>
          </div>
          <div className="flex justify-center mt-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/about" className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                About LunchLit
              </Link>
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
