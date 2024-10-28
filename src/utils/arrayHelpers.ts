export const chunkArray = <T>(array: T[], chunkSize: number) => {
  if (array.length < chunkSize) return [array];

  const chunks = [];

  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }

  return chunks;
};
