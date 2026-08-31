const loadImage = async (file) => {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;

  try {
    await image.decode();
    return image;
  } catch {
    throw new Error(`无法读取 ${file.name}`);
  } finally {
    URL.revokeObjectURL(url);
  }
};

export async function readPhotoDimensions(file) {
  const image = await loadImage(file);
  const scale = Math.min(1, 640 / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("浏览器无法生成预览图");
  context.drawImage(image, 0, 0, width, height);

  const thumbnail = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("预览图生成失败"));
      },
      "image/webp",
      0.78,
    );
  });

  return {
    thumbnail,
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}
