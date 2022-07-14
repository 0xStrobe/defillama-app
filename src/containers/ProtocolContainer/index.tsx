import * as React from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { transparentize } from 'polished'
import { useInView, defaultFallbackInView } from 'react-intersection-observer'
import { ArrowUpRight, DownloadCloud } from 'react-feather'
import Layout from '~/layout'
import { ButtonLight } from '~/components/ButtonStyled'
import CopyHelper from '~/components/Copy'
import FormattedName from '~/components/FormattedName'
import TokenLogo from '~/components/TokenLogo'
import SEO from '~/components/SEO'
import { ProtocolsChainsSearch } from '~/components/Search'
import AuditInfo from '~/components/AuditInfo'
import ProtocolTvlChart from '~/components/TokenChart/ProtocolTvlChart'
import QuestionHelper from '~/components/QuestionHelper'
import type { IChartProps } from '~/components/TokenChart/types'
import { defiTvlOptions, extraTvlSettings } from '~/components/Settings'
import { useScrollToTop } from '~/hooks'
import { useCalcSingleExtraTvl } from '~/hooks/data'
import { useSettingsManager, useToggleSetting } from '~/contexts/LocalStorage'
import { capitalizeFirstLetter, formattedNum, getBlockExplorer, standardizeProtocolName, toK } from '~/utils'
import { useFetchProtocol } from '~/api/categories/protocols/client'
import { buildProtocolData } from '~/utils/protocolData'
import boboLogo from '~/assets/boboSmug.png'
import { IFusedProtocolData } from '~/api/types'
import { Checkbox2 } from '~/components'

defaultFallbackInView(true)

const AreaChart = dynamic(() => import('~/components/TokenChart/AreaChart'), {
	ssr: false
}) as React.FC<IChartProps>

const BarChart = dynamic(() => import('~/components/TokenChart/BarChart'), {
	ssr: false
}) as React.FC<IChartProps>

const Stats = styled.section`
	display: grid;
	grid-template-columns: 1fr;
	border-radius: 12px;
	background: ${({ theme }) => theme.bg6};
	border: ${({ theme }) => '1px solid ' + theme.divider};
	box-shadow: ${({ theme }) => theme.shadowSm};
	position: relative;
	isolation: isolate;

	@media (min-width: 80rem) {
		grid-template-columns: auto 1fr;
	}
`

const ProtocolDetails = styled.div`
	display: flex;
	flex-direction: column;
	gap: 36px;
	padding: 24px;
	padding-bottom: calc(24px + 0.4375rem);
	color: ${({ theme }) => theme.text1};
	background: ${({ theme }) => theme.bg7};
	grid-column: span 1;
	border-radius: 12px 12px 0 0;

	@media (min-width: 80rem) {
		min-width: 380px;
		border-radius: 0 0 0 12px;
	}
`

const ProtocolName = styled.h1`
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 1.25rem;
`

const Symbol = styled.span`
	font-weight: 400;
`

const Table = styled.table`
	border-collapse: collapse;

	caption,
	thead th {
		font-weight: 400;
		font-size: 0.75rem;
		text-align: left;
		color: ${({ theme }) => (theme.mode === 'dark' ? '#969b9b' : '#545757')};
	}

	th {
		font-weight: 600;
		font-size: 1rem;
		text-align: start;
	}

	td {
		font-weight: 400;
		font-size: 0.875rem;
		text-align: right;
		font-family: var(--font-jetbrains);
	}

	thead td {
		> * {
			width: min-content;
			background: none;
			margin-left: auto;
			color: ${({ theme }) => theme.text1};
		}
	}

	thead > tr > *,
	caption {
		padding: 0 0 4px;
	}

	tbody > tr > * {
		padding: 4px 0;
	}

	.question-helper {
		padding: 0 16px;
	}
`

const Tvl = styled.p`
	font-weight: 700;
	font-size: 2rem;
	display: flex;
	flex-direction: column;
	gap: 8px;

	& > *:first-child {
		font-weight: 400;
		font-size: 0.75rem;
		text-align: left;
		color: ${({ theme }) => (theme.mode === 'dark' ? '#969b9b' : '#545757')};
	}
`

const SectionHeader = styled.h2`
	font-weight: 700;
	font-size: 1.25rem;
	margin: 0 0 -24px;
	border-left: 1px solid transparent;
`

const InfoWrapper = styled.section`
	padding: 24px;
	background: ${({ theme }) => theme.bg7};
	border: ${({ theme }) => '1px solid ' + theme.divider};
	border-radius: 12px;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: repeat(3, auto);
	box-shadow: ${({ theme }) => theme.shadowSm};

	@media (min-width: 80rem) {
		grid-template-rows: repeat(2, auto);
	}
`

const Section = styled.section`
	grid-column: 1 / -1;
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 24px 0;
	border-bottom: 1px solid transparent;

	h3 {
		font-weight: 600;
		font-size: 1.125rem;
	}

	&:not(:first-of-type) {
		border-top: ${({ theme }) => '1px solid ' + theme.text5};
	}

	&:first-of-type {
		padding-top: 0;
	}

	&:last-of-type {
		padding-bottom: 0;
		border-bottom: none;
	}

	p {
		line-height: 1.5rem;
	}

	@media (min-width: 80rem) {
		h3:not(:first-of-type) {
			margin-top: 24px;
		}

		&:nth-child(1) {
			grid-column: 1 / 2;
			border-right: 1px solid transparent;
		}

		&:nth-child(2) {
			grid-column: 1 / 2;
			padding-bottom: 0;
			border-right: 1px solid transparent;
			border-bottom: none;
		}

		&:nth-child(3) {
			grid-row: 1 / -1;
			grid-column: 2 / 3;
			border-top: 0;
			border-left: ${({ theme }) => '1px solid ' + theme.text5};
			padding: 0 0 0 24px;
			margin-left: 24px;
		}
	}
`

const LinksWrapper = styled.section`
	display: flex;
	gap: 16px;
	flex-wrap: wrap;
`

const Button = styled(ButtonLight)`
	display: flex;
	gap: 4px;
	align-items: center;
	padding: 8px 12px;
	font-size: 0.875rem;
	font-weight: 400;
	white-space: nowrap;
	font-family: var(--font-inter);
`

const FlexRow = styled.p`
	display: flex;
	align-items: center;
	gap: 8px;
`

const Bobo = styled.button`
	position: absolute;
	bottom: -36px;
	left: 0;

	img {
		width: 34px !important;
		height: 34px !important;
	}

	@media (min-width: 80rem) {
		top: 0;
		right: 0;
		bottom: initial;
		left: initial;
		z-index: 1;
	}
`

const DownloadButton = styled(Button)`
	display: flex;
	align-items: center;
	color: inherit;
	padding: 8px 12px;
	border-radius: 10px;
`

const TvlWrapper = styled.section`
	display: flex;
	gap: 20px;
	align-items: flex-end;
	justify-content: space-between;
	flex-wrap: wrap;
`

const ExtraTvlOption = styled.label`
	display: flex;
	align-items: center;
	gap: 8px;

	:hover {
		cursor: pointer;
	}
`

const ChartsWrapper = styled.section`
	display: grid;
	grid-template-columns: 1fr 1fr;
	border-radius: 12px;
	background: ${({ theme }) => theme.bg6};
	border: ${({ theme }) => '1px solid ' + theme.divider};
	box-shadow: ${({ theme }) => theme.shadowSm};
`

const ChartWrapper = styled.section`
	grid-column: span 2;
	min-height: 360px;
	padding: 20px;
	display: flex;
	flex-direction: column;

	@media (min-width: 90rem) {
		grid-column: span 1;

		:last-child:nth-child(2n - 1) {
			grid-column: span 2;
		}
	}
`

const OtherProtocols = styled.nav`
	grid-column: span 1;
	display: flex;
	overflow-x: auto;
	background: ${({ theme }) => theme.bg7};
	font-weight: 500;
	border-radius: 12px 12px 0 0;

	@media (min-width: 80rem) {
		grid-column: span 2;
	}
`

interface IProtocolLink {
	active: boolean
	color: string | null
}

const ProtocolLink = styled.a<IProtocolLink>`
	padding: 8px 24px;
	white-space: nowrap;

	& + & {
		border-left: ${({ theme }) => '1px solid ' + theme.divider};
	}

	border-bottom: ${({ active, color, theme }) => '1px solid ' + (active ? color : theme.divider)};

	:first-child {
		border-top-left-radius: 12px;
	}

	:hover,
	:focus-visible {
		background-color: ${({ color }) => transparentize(0.9, color)};
	}
`

interface IProtocolContainerProps {
	title: string
	protocol: string
	protocolData: IFusedProtocolData
	backgroundColor: string
}

const isLowerCase = (letter: string) => letter === letter.toLowerCase()

function ProtocolContainer({ title, protocolData, protocol, backgroundColor }: IProtocolContainerProps) {
	useScrollToTop()

	const {
		address = '',
		name,
		symbol,
		url,
		description,
		tvl,
		logo,
		audits,
		category,
		twitter,
		tvlBreakdowns = {},
		tvlByChain = [],
		tvlChartData,
		audit_links,
		methodology,
		module: codeModule,
		historicalChainTvls,
		chains = [],
		forkedFrom,
		otherProtocols,
		hallmarks,
		gecko_id
	} = protocolData

	const router = useRouter()

	const { blockExplorerLink, blockExplorerName } = getBlockExplorer(address)

	const totalVolume = useCalcSingleExtraTvl(tvlBreakdowns, tvl)

	const [bobo, setBobo] = React.useState(false)

	const tvlToggles = useToggleSetting()

	const extraTvlsEnabled = useSettingsManager(extraTvlSettings)

	const {
		tvls: tvlsByChain,
		extraTvls,
		tvlOptions
	} = tvlByChain.reduce(
		(acc, [name, tvl]: [string, number]) => {
			// skip masterchef tvl type and only return non zero tvls
			if (name === 'masterchef' || tvl === 0) return acc

			// check if tvl name is addl tvl type and is toggled
			if (isLowerCase(name[0]) && extraTvlSettings.includes(name) && tvl !== 0) {
				acc.extraTvls.push([name, tvl])
				acc.tvlOptions.push(defiTvlOptions.find((e) => e.key === name))
			} else {
				// only include total tvl of each chain skip breakdown of addl tvls if extra tvl type is not toggled
				if (!name.includes('-')) {
					acc.tvls[name] = (acc.tvls[name] || 0) + tvl
				} else {
					// format name to only include chain name and check if it already exists in tvls list
					const chainName = name.split('-')[0]
					const prop = name.split('-')[1]

					// check if prop is toggled
					if (extraTvlsEnabled[prop.toLowerCase()]) {
						acc.tvls[chainName] = (acc.tvls[chainName] || 0) + tvl
					}
				}
			}
			return acc
		},
		{
			tvls: {},
			extraTvls: [],
			tvlOptions: []
		}
	)

	const tvls = Object.entries(tvlsByChain)

	const { data: addlProtocolData, loading } = useFetchProtocol(protocol)

	const { usdInflows, tokenInflows, tokensUnique, tokenBreakdown, tokenBreakdownUSD, chainsStacked } = React.useMemo(
		() => buildProtocolData(addlProtocolData),
		[addlProtocolData]
	)

	const chainsSplit = React.useMemo(() => {
		return chainsStacked?.map((chain) => {
			if (chain.extraTvl) {
				const data = { ...chain }

				for (const c in chain.extraTvl) {
					for (const extra in chain.extraTvl[c]) {
						if (extraTvlsEnabled[extra?.toLowerCase()]) {
							data[c] += chain.extraTvl[c][extra]
						}
					}
				}

				return data
			}
			return chain
		})
	}, [chainsStacked, extraTvlsEnabled])

	const chainsUnique = tvls.map((t) => t[0])

	const showCharts =
		loading ||
		(chainsSplit && chainsUnique?.length > 1) ||
		(tokenBreakdown?.length > 1 && tokenBreakdownUSD?.length > 1 && tokensUnique?.length > 1) ||
		tokensUnique?.length > 0 ||
		usdInflows ||
		tokenInflows
			? true
			: false

	const queryParams = router.asPath.split('?')[1] ? `?${router.asPath.split('?')[1]}` : ''

	return (
		<Layout title={title} backgroundColor={transparentize(0.6, backgroundColor)} style={{ gap: '36px' }}>
			<SEO cardName={name} token={name} logo={logo} tvl={formattedNum(totalVolume, true)?.toString()} />

			<ProtocolsChainsSearch step={{ category: 'Protocols', name }} options={tvlOptions} />

			<Stats>
				{otherProtocols?.length > 1 && (
					<OtherProtocols>
						{otherProtocols.map((p) => (
							<Link href={`/protocol/${standardizeProtocolName(p)}`} key={p} passHref>
								<ProtocolLink
									active={router.asPath === `/protocol/${standardizeProtocolName(p)}` + queryParams}
									color={backgroundColor}
								>
									{p}
								</ProtocolLink>
							</Link>
						))}
					</OtherProtocols>
				)}
				<ProtocolDetails style={{ borderTopLeftRadius: otherProtocols?.length > 1 ? 0 : '12px' }}>
					<ProtocolName>
						<TokenLogo logo={logo} size={24} />
						<FormattedName text={name ? name + ' ' : ''} maxCharacters={16} fontWeight={700} />
						<Symbol>{symbol && symbol !== '-' ? `(${symbol})` : ''}</Symbol>
					</ProtocolName>

					<TvlWrapper>
						<Tvl>
							<span>Total Value Locked</span>
							<span>{formattedNum(totalVolume || '0', true)}</span>
						</Tvl>

						<Link href={`https://api.llama.fi/dataset/${protocol}.csv`} passHref>
							<DownloadButton as="a" color={backgroundColor}>
								<DownloadCloud size={14} />
								<span>&nbsp;&nbsp;.csv</span>
							</DownloadButton>
						</Link>
					</TvlWrapper>

					{tvls.length > 1 && (
						<Table>
							<caption>Chain Breakdown</caption>
							<tbody>
								{tvls.map((chainTvl) => (
									<tr key={chainTvl[0]}>
										<th>{capitalizeFirstLetter(chainTvl[0])}</th>
										<td>${toK(chainTvl[1] || 0)}</td>
									</tr>
								))}
							</tbody>
						</Table>
					)}

					{extraTvls.length > 0 && (
						<Table>
							<thead>
								<tr>
									<th>Include in TVL (optional)</th>
									<td className="question-helper">
										<QuestionHelper text='People define TVL differently. Instead of being opinionated, we give you the option to choose what you would include in a "real" TVL calculation' />
									</td>
								</tr>
							</thead>
							<tbody>
								{extraTvls.map(([option, value]) => (
									<tr key={option}>
										<th>
											<ExtraTvlOption>
												<Checkbox2
													type="checkbox"
													value={option}
													checked={extraTvlsEnabled[option]}
													onChange={tvlToggles(option)}
												/>
												<span style={{ opacity: extraTvlsEnabled[option] ? 1 : 0.7 }}>
													{capitalizeFirstLetter(option)}
												</span>
											</ExtraTvlOption>
										</th>
										<td>${toK(value)}</td>
									</tr>
								))}
							</tbody>
						</Table>
					)}
				</ProtocolDetails>

				<ProtocolTvlChart
					protocol={protocol}
					tvlChartData={tvlChartData}
					color={backgroundColor}
					historicalChainTvls={historicalChainTvls}
					chains={chains}
					hallmarks={hallmarks}
					bobo={bobo}
					geckoId={gecko_id}
				/>

				<Bobo onClick={() => setBobo(!bobo)}>
					<span className="visually-hidden">Enable Goblin Mode</span>
					<Image src={boboLogo} width="34px" height="34px" alt="bobo cheers" />
				</Bobo>
			</Stats>

			<SectionHeader>Information</SectionHeader>
			<InfoWrapper>
				<Section>
					<h3>Protocol Information</h3>
					{description && <p>{description}</p>}

					{category && (
						<FlexRow>
							<span>Category</span>
							<span>:</span>
							<Link href={`/protocols/${category.toLowerCase()}`}>{category}</Link>
						</FlexRow>
					)}

					{forkedFrom && (
						<FlexRow>
							<span>Forked from</span>
							<span>:</span>
							<>
								{forkedFrom.map((p, index) => (
									<Link href={`/protocol/${p}`} key={p}>
										{forkedFrom[index + 1] ? p + ', ' : p}
									</Link>
								))}
							</>
						</FlexRow>
					)}

					{audits && audit_links && <AuditInfo audits={audits} auditLinks={audit_links} color={backgroundColor} />}

					<LinksWrapper>
						<Link href={url} passHref>
							<Button as="a" target="_blank" rel="noopener noreferrer" useTextColor={true} color={backgroundColor}>
								<span>Website</span> <ArrowUpRight size={14} />
							</Button>
						</Link>

						{twitter && (
							<Link href={`https://twitter.com/${twitter}`} passHref>
								<Button as="a" target="_blank" rel="noopener noreferrer" useTextColor={true} color={backgroundColor}>
									<span>Twitter</span> <ArrowUpRight size={14} />
								</Button>
							</Link>
						)}
					</LinksWrapper>
				</Section>
				<Section>
					<h3>Token Information</h3>

					{address && (
						<FlexRow>
							<span>Address</span>
							<span>:</span>
							<span>{address.slice(0, 8) + '...' + address?.slice(36, 42)}</span>
							<CopyHelper toCopy={address} disabled={!address} />
						</FlexRow>
					)}

					<LinksWrapper>
						{protocolData.gecko_id && (
							<Link href={`https://www.coingecko.com/en/coins/${protocolData.gecko_id}`} passHref>
								<Button as="a" target="_blank" rel="noopener noreferrer" useTextColor={true} color={backgroundColor}>
									<span>View on CoinGecko</span> <ArrowUpRight size={14} />
								</Button>
							</Link>
						)}
						{blockExplorerLink && (
							<Link href={blockExplorerLink} passHref>
								<Button as="a" target="_blank" rel="noopener noreferrer" useTextColor={true} color={backgroundColor}>
									<span>View on {blockExplorerName}</span> <ArrowUpRight size={14} />
								</Button>
							</Link>
						)}
					</LinksWrapper>
				</Section>
				<Section>
					<h3>Methodology</h3>
					{methodology && <p>{methodology}</p>}
					<LinksWrapper>
						{codeModule && (
							<Link href={`https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/projects/${codeModule}`} passHref>
								<Button as="a" target="_blank" rel="noopener noreferrer" useTextColor={true} color={backgroundColor}>
									<span>Check the code</span>
									<ArrowUpRight size={14} />
								</Button>
							</Link>
						)}
					</LinksWrapper>
				</Section>
			</InfoWrapper>

			{showCharts && (
				<>
					<SectionHeader>Charts</SectionHeader>

					<ChartsWrapper>
						{loading ? (
							<span
								style={{
									height: '360px',
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									gridColumn: '1 / -1'
								}}
							>
								Loading...
							</span>
						) : (
							<>
								{chainsSplit && chainsUnique?.length > 1 && (
									<Chart>
										<AreaChart chartData={chainsSplit} tokensUnique={chainsUnique} title="Chains" />
									</Chart>
								)}
								{tokenBreakdown?.length > 1 && tokensUnique?.length > 1 && (
									<Chart>
										<AreaChart chartData={tokenBreakdown} title="Tokens" tokensUnique={tokensUnique} moneySymbol="" />
									</Chart>
								)}
								{tokenBreakdownUSD?.length > 1 && tokensUnique?.length > 1 && (
									<Chart>
										<AreaChart chartData={tokenBreakdownUSD} title="Tokens (USD)" tokensUnique={tokensUnique} />
									</Chart>
								)}
								{usdInflows && (
									<Chart>
										<BarChart chartData={usdInflows} color={backgroundColor} title="USD Inflows" />
									</Chart>
								)}
								{tokenInflows && (
									<Chart>
										<BarChart chartData={tokenInflows} title="Token Inflows" tokensUnique={tokensUnique} />
									</Chart>
								)}
							</>
						)}
					</ChartsWrapper>
				</>
			)}
		</Layout>
	)
}

const Chart = ({ children }) => {
	const { ref, inView } = useInView({
		triggerOnce: true
	})

	return <ChartWrapper ref={ref}>{inView && children}</ChartWrapper>
}

export default ProtocolContainer
