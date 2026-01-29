import { Spinner } from './ui/spinner';

interface ILoadingFetchingProps {
  loading: boolean;
  error?: string;
}

export default function LoadingFetching(props: ILoadingFetchingProps) {
  if (props.loading) {
    return (
      <Spinner className="size-12 text-gray-500 self-center items-center" />
    );
  }

  if (props.error) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <p className="text-red-800">{props.error}</p>
      </div>
    );
  }

  return null;
}
