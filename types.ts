export enum ViewMode {
  XML = 'XML',
  JSON = 'JSON'
}

export enum StatusType {
  IDLE = 'IDLE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  LOADING = 'LOADING'
}

export interface ProcessingResult {
  content: string;
  status: StatusType;
  message?: string;
}

export interface XmlError {
  line: number;
  message: string;
}