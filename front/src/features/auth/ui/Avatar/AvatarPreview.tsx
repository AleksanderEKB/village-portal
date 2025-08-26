import React from 'react';

interface AvatarPreviewProps {
  file: File | null;
  onRemove: () => void;
}

const AvatarPreview: React.FC<AvatarPreviewProps> = ({ file, onRemove }) => {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!file) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
      {url && (
        <img
          src={url}
          alt="avatar preview"
          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%' }}
        />
      )}
      <button type="button" onClick={onRemove}>
        Удалить
      </button>
    </div>
  );
};

export default AvatarPreview;
