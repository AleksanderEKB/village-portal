type BuildArgs = {
  authorId: string;
  body: string;
  image: File | null;
  mode: 'create' | 'edit';
  hasCurrentImage: boolean;
};

export function buildPostFormData({ authorId, body, image, mode, hasCurrentImage }: BuildArgs) {
  const formData = new FormData();
  formData.append('author', authorId);
  formData.append('body', body);

  if (image) {
    formData.append('image', image);
  } else if (mode === 'edit' && !hasCurrentImage) {
    // сигнал на удаление картинки при редактировании
    formData.append('image', '');
  }

  return formData;
}
