export class UrlReplacer {

    private replacements: Map<string, string> = new Map();

    public withReplacement(replace: string, by: string): this {
        this.replacements.set(replace, by);
        return this;
    }

    public replace(url: string): string {
        this.replacements.forEach((replacement, search) => {
            url = url.replace(search, replacement);
        });
        return url;
    }
}