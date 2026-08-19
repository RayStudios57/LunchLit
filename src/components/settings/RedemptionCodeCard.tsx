import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { redeemSecretCode, isCodeRedeemed } from '@/lib/secrets';
import { toast } from 'sonner';

/**
 * Reusable redemption-code card. Works the same whether the user is in
 * Tabs layout or Sidebar layout — it lives in Profile settings so codes
 * can always be redeemed from one consistent place.
 */
export function RedemptionCodeCard() {
  const { setTheme } = useTheme();
  const [code, setCode] = useState('');
  const [redeemed, setRedeemed] = useState(isCodeRedeemed());

  useEffect(() => {
    const handler = () => setRedeemed(isCodeRedeemed());
    window.addEventListener('secret-unlock', handler);
    return () => window.removeEventListener('secret-unlock', handler);
  }, []);

  const handleRedeem = () => {
    if (redeemSecretCode(code.trim())) {
      setTheme('matrix' as any);
      toast.success('⛓️ Matrix Anomaly theme unlocked!');
      setRedeemed(true);
      setCode('');
    } else {
      toast.error('Invalid code. The anomaly remains hidden.');
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="font-display flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          Redemption Code
        </CardTitle>
        <CardDescription>
          Enter a secret code to claim hidden rewards. Case-sensitive.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your code"
            className="font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
          />
          <Button onClick={handleRedeem} className="shrink-0">Redeem</Button>
        </div>
        {redeemed && (
          <p className="text-xs text-primary flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Secret code already redeemed — Matrix Anomaly theme available.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
