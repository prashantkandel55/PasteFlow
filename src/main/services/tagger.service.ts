export class TaggerService {
  private static rules = [
    { tag: '#link', regex: /(https?:\/\/[^\s]+)/g },
    { tag: '#email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
    { tag: '#sensitive', regex: /(sk_live_|AIza|ssh-rsa|-----BEGIN|4[0-9]{12}(?:[0-9]{3})?)/g },
    { tag: '#code', regex: /(\s*{[\s\S]*}\s*|function\s+\w+\s*\(|const\s+\w+\s*=|import\s+.*from)/g },
    { tag: '#data', regex: /(SELECT\s+.*\s+FROM|INSERT\s+INTO|UPDATE\s+.*\s+SET|\[\s*{.*}\s*\])/gi }
  ];

  static analyze(text: string): string[] {
    const tags: string[] = [];
    for (const rule of this.rules) {
      if (rule.regex.test(text)) {
        tags.push(rule.tag);
      }
    }
    return tags;
  }
}
