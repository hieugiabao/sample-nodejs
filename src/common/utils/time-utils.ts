export class TimeUtils {
  public static currentSeconds(): number {
    const now = new Date();
    return Math.round(now.getTime() / 1000);
  }

  public static nextSeconds(offset: number): number {
    const now = new Date();
    return Math.round(now.getTime() / 1000) + offset;
  }
}
