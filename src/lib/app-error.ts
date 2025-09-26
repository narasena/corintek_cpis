interface IAppErrorOptions {
  status: number;
  message: string;
  isExpose?: boolean;
}

export class AppError extends Error {
  public readonly status: number;
  public readonly isExpose?: boolean;

  constructor(options: IAppErrorOptions) {
    const { status, message, isExpose } = options;
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.isExpose = isExpose;
  }
}