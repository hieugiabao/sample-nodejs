import { settings } from "@config/settings";
import { Allow } from "class-validator";

export class PaginationQuery {
  @Allow()
  page?: number;

  @Allow()
  limit?: number;

  get take(): number {
    const limit = Number(this.limit) || settings.pagination.limit.default;

    return limit > 0 && limit <= settings.pagination.limit.maximum
      ? limit
      : settings.pagination.limit.default;
  }

  get skip(): number {
    const page = (Number(this.page) || 1) - 1;

    return (page < 0 ? 0 : page) * this.take;
  }
}
