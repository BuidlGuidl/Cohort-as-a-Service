import DOMPurify from "isomorphic-dompurify";

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  score?: number;
}

export interface ValidationOptions {
  checkText?: boolean;
  checkImages?: boolean;
  strictMode?: boolean;
}

class ContentValidator {
  private textFilter: any;
  private imageClassifier: any;

  async initialize() {
    if (typeof window !== "undefined") {
      try {
        const { Filter } = await import("bad-words");
        this.textFilter = new Filter();

        const customWords = ["scam", "pyramid", "ponzi", "rugpull", "rug-pull"].filter(
          word => typeof word === "string" && word.length > 0,
        );

        if (customWords.length > 0) {
          this.textFilter.addWords(customWords);
        }
      } catch (error) {
        console.warn("Failed to initialize profanity filter:", error);
        this.textFilter = null;
      }
    }
  }

  /**
   * Validates HTML content for NSFW text and images
   */
  async validateContent(
    htmlContent: string,
    options: ValidationOptions = { checkText: true, checkImages: true },
  ): Promise<ValidationResult> {
    try {
      const cleanHtml = DOMPurify.sanitize(htmlContent);

      if (options.checkText) {
        const textResult = await this.validateText(cleanHtml);
        if (!textResult.isValid) return textResult;
      }

      if (options.checkImages) {
        const imageResult = await this.validateImages(cleanHtml);
        if (!imageResult.isValid) return imageResult;
      }

      return { isValid: true };
    } catch (error) {
      console.error("Content validation error:", error);
      return { isValid: false, reason: "Validation service unavailable" };
    }
  }

  /**
   * Validates text content for profanity and inappropriate language
   */
  private async validateText(htmlContent: string): Promise<ValidationResult> {
    const textContent = this.extractTextFromHtml(htmlContent);

    if (!textContent.trim()) {
      return { isValid: true };
    }

    // Client-side profanity check
    if (this.textFilter?.isProfane(textContent)) {
      return {
        isValid: false,
        reason: "Content contains inappropriate language",
      };
    }

    // Additional pattern-based checks
    const suspiciousPatterns = [
      /\b(sex|porn|xxx|nude|naked)\b/gi,
      /\b(fuck|shit|bitch|damn)\b/gi,
      /\b(hate|kill|die|murder)\b/gi,
      /\b(scam|fraud|steal|money back)\b/gi,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(textContent)) {
        return {
          isValid: false,
          reason: "Content contains inappropriate language",
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validates base64 images for NSFW content
   */
  private async validateImages(htmlContent: string): Promise<ValidationResult> {
    const imageUrls = this.extractImageUrls(htmlContent);

    for (const imageUrl of imageUrls) {
      if (imageUrl.startsWith("data:image/")) {
        const result = await this.validateBase64Image(imageUrl);
        if (!result.isValid) return result;
      }
    }

    return { isValid: true };
  }

  /**
   * Validates a single base64 image using NSFW detection
   */
  private async validateBase64Image(base64Image: string): Promise<ValidationResult> {
    try {
      if (typeof window !== "undefined") {
        const nsfwjs = await import("nsfwjs");
        // const tf = await import("@tensorflow/tfjs");

        const model = await nsfwjs.load();

        // Convert base64 to image element
        const img = new Image();
        img.src = base64Image;

        await new Promise(resolve => {
          img.onload = resolve;
        });

        const predictions = await model.classify(img);

        const nsfwThreshold = 0.3;
        const nsfwCategories = ["Porn", "Sexy", "Hentai"];

        for (const prediction of predictions) {
          if (nsfwCategories.includes(prediction.className) && prediction.probability > nsfwThreshold) {
            return {
              isValid: false,
              reason: "Image contains inappropriate content",
              score: prediction.probability,
            };
          }
        }
      }

      // Option 2: Server-side validation via API
      // const response = await fetch('/api/validate-image', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ image: base64Image })
      // });
      // const result = await response.json();
      // return result;

      return { isValid: true };
    } catch (error) {
      console.error("Image validation error:", error);
      return { isValid: true };
    }
  }

  private extractTextFromHtml(html: string): string {
    if (typeof window !== "undefined") {
      const div = document.createElement("div");
      div.innerHTML = html;
      return div.textContent || div.innerText || "";
    }
    return html.replace(/<[^>]*>/g, "");
  }

  private extractImageUrls(html: string): string[] {
    const imgRegex = /<img[^>]+src="([^">]+)"/gi;
    const urls: string[] = [];
    let match;

    while ((match = imgRegex.exec(html)) !== null) {
      urls.push(match[1]);
    }

    return urls;
  }
}

// Singleton instance
export const contentValidator = new ContentValidator();
