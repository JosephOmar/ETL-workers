type WorkersStatusProps = {
  loading: boolean;
  error: string | null;
};

export const WorkersStatus = ({ loading, error }: WorkersStatusProps) => {
  if (loading) return <div className="text-center p-4">Cargando...</div>;
  if (error) return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  return null;
};
