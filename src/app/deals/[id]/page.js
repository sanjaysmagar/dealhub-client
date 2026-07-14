import DetailClient from './DetailClient';

export default async function Page({ params }) {
  const { id } = await params;
  return <DetailClient dealId={id} />;
}