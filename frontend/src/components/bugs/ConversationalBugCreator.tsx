import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Wand2 } from 'lucide-react';
import * as aiApi from '@/api/ai';
import type { NLParseResult } from '@/types';

interface ConversationalBugCreatorProps {
  onParsed: (result: NLParseResult) => void;
}

export default function ConversationalBugCreator({ onParsed }: ConversationalBugCreatorProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await aiApi.parseNaturalLanguage({ text: text.trim() });
      onParsed(result);
    } catch {
      setError('Failed to parse. Please try again or fill out the form manually.');
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Describe Bug in Natural Language
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe the bug naturally, e.g.: 'When I click the submit button on the login page, it shows a 500 error. This is critical because users cannot log in.'"
          rows={4}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {loading && <Skeleton className="h-8 w-full" />}
        <Button
          variant="secondary"
          size="sm"
          onClick={handleParse}
          disabled={!text.trim() || loading}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          {loading ? 'Parsing...' : 'Parse & Fill Form'}
        </Button>
      </CardContent>
    </Card>
  );
}
