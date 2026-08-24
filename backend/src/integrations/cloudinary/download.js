const downloadFile = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export { downloadFile };
