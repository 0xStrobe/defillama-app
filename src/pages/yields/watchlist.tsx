import Layout from '~/layout'
import { YieldsWatchlistContainer } from '~/containers/Watchlist'
import Announcement from '~/components/Announcement'
import { disclaimer } from '~/components/YieldsPage/utils'
import { addMaxAgeHeaderForNext } from '~/api'
import { getYieldPageData } from '~/api/categories/yield'
import { compressPageProps, decompressPageProps } from '~/utils/compress'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
	addMaxAgeHeaderForNext(res, [23], 3600)
	const data = await getYieldPageData()

	const compressed = compressPageProps(data.props.pools)

	return {
		props: { compressed }
	}
}

export default function Portfolio({ compressed }) {
	const data = decompressPageProps(compressed)

	return (
		<Layout title={`Saved Pools - DefiLlama`} defaultSEO>
			<Announcement>{disclaimer}</Announcement>
			<YieldsWatchlistContainer protocolsDict={data} />
		</Layout>
	)
}
