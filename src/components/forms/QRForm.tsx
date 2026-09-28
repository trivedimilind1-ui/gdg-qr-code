import React from 'react';
import type {
  QRType,
  QRData,
  URLData,
  TextData,
  EmailData,
  PhoneData,
  WifiData,
  ValidationErrors,
} from '../../types/qr';
import { URLForm } from './URLForm';
import { TextForm } from './TextForm';
import { EmailForm } from './EmailForm';
import { PhoneForm } from './PhoneForm';
import { WifiForm } from './WifiForm';

interface QRFormProps {
  type: QRType;
  data: QRData;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  onChange: (field: string, value: unknown) => void;
  onBlur: (field: string) => void;
}

export const QRForm: React.FC<QRFormProps> = ({
  type,
  data,
  errors,
  touched,
  onChange,
  onBlur,
}) => {
  switch (type) {
    case 'url':
      return (
        <URLForm
          data={data as URLData}
          errors={errors}
          touched={touched}
          onChange={(field, val) => onChange(field, val)}
          onBlur={onBlur}
        />
      );

    case 'text':
      return (
        <TextForm
          data={data as TextData}
          errors={errors}
          touched={touched}
          onChange={(field, val) => onChange(field, val)}
          onBlur={onBlur}
        />
      );

    case 'email':
      return (
        <EmailForm
          data={data as EmailData}
          errors={errors}
          touched={touched}
          onChange={(field, val) => onChange(field, val)}
          onBlur={onBlur}
        />
      );

    case 'phone':
      return (
        <PhoneForm
          data={data as PhoneData}
          errors={errors}
          touched={touched}
          onChange={(field, val) => onChange(field, val)}
          onBlur={onBlur}
        />
      );

    case 'wifi':
      return (
        <WifiForm
          data={data as WifiData}
          errors={errors}
          touched={touched}
          onChange={(field, val) => onChange(field, val)}
          onBlur={onBlur}
        />
      );

    default:
      return null;
  }
};
