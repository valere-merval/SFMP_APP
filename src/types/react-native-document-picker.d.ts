declare module 'react-native-document-picker' {
  export type DocumentPickerResponse = {
    uri: string;
    fileCopyUri?: string | null;
    name?: string | null;
    type?: string | null;
    size?: number | null;
  };

  export const types: {
    images: string;
    pdf: string;
    allFiles: string;
  };

  export function pickSingle(options?: {
    allowMultiSelection?: boolean;
    presentationStyle?: 'fullScreen' | 'pageSheet' | 'formSheet' | 'overFullScreen';
    type?: string[];
  }): Promise<DocumentPickerResponse>;

  export function isCancel(error: unknown): boolean;

  const DocumentPicker: {
    pickSingle: typeof pickSingle;
    isCancel: typeof isCancel;
    types: typeof types;
  };

  export default DocumentPicker;
}
