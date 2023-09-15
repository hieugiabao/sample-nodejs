export class StringUtils {
  public static transformString(str: string): string {
    // Lowercase the string
    let transformedStr = str.toLowerCase();

    // Remove accents, swap ñ for n, etc
    transformedStr = transformedStr
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    // Replace spaces with -
    transformedStr = transformedStr.replace(/\s+/g, '-');

    // Remove all non-word chars
    transformedStr = transformedStr.replace(/[^\w-]/g, '');

    return transformedStr;
  }
}
