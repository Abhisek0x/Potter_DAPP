import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
	input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
	padding: 10px;
	border-radius: 50px;
	border: none;
	background-color: red;
	padding: 10px;
	font-weight: bold;
	color: var(--secondary-text);
	width: 100px;
	cursor: pointer;
	box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
	-webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
	-moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
	:active {
		box-shadow: none;
		-webkit-box-shadow: none;
		-moz-box-shadow: none;
	}
`;

export const StyledRoundButton = styled.button`
	padding: 10px;
	border-radius: 100%;
	border: none;
	background-color: red;
	padding: 10px;
	font-weight: bold;
	font-size: 15px;
	color: var(--primary-text);
	width: 30px;
	height: 30px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
	-webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
	-moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
	:active {
		box-shadow: none;
		-webkit-box-shadow: none;
		-moz-box-shadow: none;
	}
`;

export const ResponsiveWrapper = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	justify-content: stretched;
	align-items: stretched;
	width: 100%;
	@media (min-width: 767px) {
		flex-direction: row;
	}
`;

export const StyledLogo = styled.img`
	box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0);
	// border: 2px solid white;
	border-radius: 10%;
	// background-color: black;
	width: 200px;
	@media (min-width: 900px) {
		width: 250px;
	}
	@media (min-width: 1000px) {
		width: 300px;
	}
	transition: width 0.5s;
`;

export const StyledImg = styled.img`
	box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0);
	border: 2px solid white;
	background-color: var(--accent);
	border-radius: 50%;
	width: 200px;
	@media (min-width: 900px) {
		width: 250px;
	}
	@media (min-width: 1000px) {
		width: 300px;
	}
	transition: width 0.5s;
`;

export const StyledLink = styled.a`
	color: red;
	text-decoration: none;
`;

function App() {
	const dispatch = useDispatch();
	const blockchain = useSelector((state) => state.blockchain);
	const data = useSelector((state) => state.data);
	const [claimingNft, setClaimingNft] = useState(false);
	const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
	const [mintAmount, setMintAmount] = useState(1);
	const [CONFIG, SET_CONFIG] = useState({
		CONTRACT_ADDRESS: "",
		SCAN_LINK: "",
		NETWORK: {
			NAME: "",
			SYMBOL: "",
			ID: 0,
		},
		NFT_NAME: "",
		SYMBOL: "",
		MAX_SUPPLY: 1,
		WEI_COST: 0,
		DISPLAY_COST: 0,
		GAS_LIMIT: 0,
		MARKETPLACE: "",
		MARKETPLACE_LINK: "",
		SHOW_BACKGROUND: false,
	});

	const claimNFTs = () => {
		let cost = CONFIG.WEI_COST;
		let gasLimit = CONFIG.GAS_LIMIT;
		let totalCostWei = String(cost * mintAmount);
		let totalGasLimit = String(gasLimit * mintAmount);
		console.log("Cost: ", totalCostWei);
		console.log("Gas limit: ", totalGasLimit);
		setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
		setClaimingNft(true);
		blockchain.smartContract.methods
			.mint(mintAmount)
			.send({
				gasLimit: String(totalGasLimit),
				to: CONFIG.CONTRACT_ADDRESS,
				from: blockchain.account,
				value: totalCostWei,
			})
			.once("error", (err) => {
				console.log(err);
				setFeedback("Sorry, something went wrong please try again later.");
				setClaimingNft(false);
			})
			.then((receipt) => {
				console.log(receipt);
				setFeedback(
					`WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
				);
				setClaimingNft(false);
				dispatch(fetchData(blockchain.account));
			});
	};

	const decrementMintAmount = () => {
		let newMintAmount = mintAmount - 1;
		if (newMintAmount < 1) {
			newMintAmount = 1;
		}
		setMintAmount(newMintAmount);
	};

	const remainingNFT = () => {
		return CONFIG.MAX_SUPPLY - data.totalSupply;
	};

	const incrementMintAmount = () => {
		let newMintAmount = mintAmount + 1;
		if (newMintAmount > 10) {
			newMintAmount = 10;
		}
		setMintAmount(newMintAmount);
	};

	const getData = () => {
		if (blockchain.account !== "" && blockchain.smartContract !== null) {
			dispatch(fetchData(blockchain.account));
		}
	};

	const getConfig = async () => {
		const configResponse = await fetch("/config/config.json", {
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		});
		const config = await configResponse.json();
		SET_CONFIG(config);
	};

	useEffect(() => {
		getConfig();
	}, []);

	useEffect(() => {
		getData();
	}, [blockchain.account]);

	return (
		<s.Screen>
			<s.Container
				flex={1}
				ai={"center"}
				style={{
					padding: 24,
					backgroundImage:
						"url('https://images.unsplash.com/photo-1618944913480-b67ee16d7b77?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80')",
				}}
			>
				<div style={{ display: "flex" }}>
					<div style={{ paddingRight: "15px", borderRadius: "none" }}>
						<StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
					</div>
					{/* <div>
						<StyledLogo alt={"logo"} src={"/config/images/logo1.png"} />
					</div> */}
				</div>

				<s.SpacerSmall />
				<ResponsiveWrapper flex={1} style={{ padding: 12 }} test>
					<s.Container flex={1} jc={"center"} ai={"center"}>
						<StyledImg alt={"example"} src={"/config/images/example.png"} />
					</s.Container>
					<s.SpacerLarge />
					<s.Container
						flex={2}
						jc={"center"}
						ai={"center"}
						style={{
							background: "transparent",
							padding: 24,
							borderRadius: 24,
							border: "1px solid black",
							boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
						}}
					>
						<s.TextTitle
							style={{
								textAlign: "center",
								fontSize: 50,
								fontWeight: "bold",
								color: "white",
							}}
						>
							<div>
								<div style={{ display: "flex" }}>
									{data.totalSupply} / {CONFIG.MAX_SUPPLY} Minted
									<div style={{ paddingLeft: "10px" }}>
										<svg
											width="32px"
											height="32px"
											viewBox="0 0 140 64"
											xmlns="http://www.w3.org/2000/svg"
											fill="currentColor"
											color="red"
										>
											<path
												d="M30.262 57.02L7.195 40.723c-5.84-3.976-7.56-12.06-3.842-18.063 3.715-6 11.467-7.65 17.306-3.68l4.52 3.76 2.6-5.274c3.717-6.002 11.47-7.65 17.305-3.68 5.84 3.97 7.56 12.054 3.842 18.062L34.49 56.118c-.897 1.512-2.793 1.915-4.228.9z"
												fill-opacity=".5"
											>
												<animate
													attributeName="fill-opacity"
													begin="0s"
													dur="1.4s"
													values="0.5;1;0.5"
													calcMode="linear"
													repeatCount="indefinite"
												></animate>
											</path>
											<path
												d="M105.512 56.12l-14.44-24.272c-3.716-6.008-1.996-14.093 3.843-18.062 5.835-3.97 13.588-2.322 17.306 3.68l2.6 5.274 4.52-3.76c5.84-3.97 13.592-2.32 17.307 3.68 3.718 6.003 1.998 14.088-3.842 18.064L109.74 57.02c-1.434 1.014-3.33.61-4.228-.9z"
												fill-opacity=".5"
											>
												<animate
													attributeName="fill-opacity"
													begin="0.7s"
													dur="1.4s"
													values="0.5;1;0.5"
													calcMode="linear"
													repeatCount="indefinite"
												></animate>
											</path>
											<path d="M67.408 57.834l-23.01-24.98c-5.864-6.15-5.864-16.108 0-22.248 5.86-6.14 15.37-6.14 21.234 0L70 16.168l4.368-5.562c5.863-6.14 15.375-6.14 21.235 0 5.863 6.14 5.863 16.098 0 22.247l-23.007 24.98c-1.43 1.556-3.757 1.556-5.188 0z"></path>
										</svg>
									</div>
								</div>

								<div style={{ color: "Grey", fontSize: "25px" }}>
									{remainingNFT()} Remaining
								</div>
							</div>
						</s.TextTitle>
						<s.TextDescription
							style={{
								textAlign: "center",
								color: "var(--primary-text)",
							}}
						>
							<StyledLink
								style={{
									display: "flex",
									padding: "20px",
									paddingBottom: "10px",
								}}
								target={"_blank"}
								href={CONFIG.SCAN_LINK}
							>
								<div style={{ color: "white", paddingRight: "10px" }}>
									Contract Address
								</div>
								{truncate(CONFIG.CONTRACT_ADDRESS, 15)}
							</StyledLink>
						</s.TextDescription>
						<s.SpacerSmall />
						{Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
							<>
								<s.TextTitle
									style={{ textAlign: "center", color: "var(--accent-text)" }}
								>
									The sale has ended.
								</s.TextTitle>
								<s.TextDescription
									style={{ textAlign: "center", color: "var(--accent-text)" }}
								>
									You can still find {CONFIG.NFT_NAME} on
								</s.TextDescription>
								<s.SpacerSmall />
								<StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
									{CONFIG.MARKETPLACE}
								</StyledLink>
							</>
						) : (
							<>
								<s.TextTitle
									style={{ textAlign: "center", color: "var(--accent-text)" }}
								>
									<div style={{ display: "flex" }}>
										<div>
											1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
											{/* {CONFIG.NETWORK.SYMBOL} */}
										</div>

										<div style={{ display: "flex", paddingLeft: "8px" }}>
											<svg
												width="32px"
												height="32px"
												viewBox="0 0 32 32"
												xmlns="http://www.w3.org/2000/svg"
												fill="currentColor"
												color="white"
											>
												<g fill-rule="evenodd">
													<path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.994-15.781L16.498 4 9 16.22l7.498 4.353 7.496-4.354zM24 17.616l-7.502 4.351L9 17.617l7.498 10.378L24 17.616z"></path>
													<g fill-rule="nonzero">
														<path
															fill-opacity=".298"
															d="M16.498 4v8.87l7.497 3.35zm0 17.968v6.027L24 17.616z"
														></path>
														<path
															fill-opacity=".801"
															d="M16.498 20.573l7.497-4.353-7.497-3.348z"
														></path>
														<path
															fill-opacity=".298"
															d="M9 16.22l7.498 4.353v-7.701z"
														></path>
													</g>
												</g>
											</svg>
										</div>
									</div>
								</s.TextTitle>
								<s.SpacerXSmall />
								<s.TextDescription
									style={{ textAlign: "center", color: "var(--accent-text)" }}
								>
									Excluding gas fees.
								</s.TextDescription>
								<s.SpacerSmall />
								{blockchain.account === "" ||
								blockchain.smartContract === null ? (
									<s.Container ai={"center"} jc={"center"}>
										<s.TextDescription
											style={{
												textAlign: "center",
												color: "var(--accent-text)",
											}}
										>
											Connect to the {CONFIG.NETWORK.NAME} network
										</s.TextDescription>
										<s.SpacerSmall />
										<StyledButton
											onClick={(e) => {
												e.preventDefault();
												dispatch(connect());
												getData();
											}}
										>
											CONNECT
										</StyledButton>
										{blockchain.errorMsg !== "" ? (
											<>
												<s.SpacerSmall />
												<s.TextDescription
													style={{
														textAlign: "center",
														color: "var(--accent-text)",
													}}
												>
													{blockchain.errorMsg}
												</s.TextDescription>
											</>
										) : null}
									</s.Container>
								) : (
									<>
										<s.TextDescription
											style={{
												textAlign: "center",
												color: "var(--accent-text)",
											}}
										>
											{feedback}
										</s.TextDescription>
										<s.SpacerMedium />
										<s.Container ai={"center"} jc={"center"} fd={"row"}>
											<StyledRoundButton
												style={{ lineHeight: 0.4 }}
												disabled={claimingNft ? 1 : 0}
												onClick={(e) => {
													e.preventDefault();
													decrementMintAmount();
												}}
											>
												-
											</StyledRoundButton>
											<s.SpacerMedium />
											<s.TextDescription
												style={{
													textAlign: "center",
													color: "var(--accent-text)",
												}}
											>
												{mintAmount}
											</s.TextDescription>
											<s.SpacerMedium />
											<StyledRoundButton
												disabled={claimingNft ? 1 : 0}
												onClick={(e) => {
													e.preventDefault();
													incrementMintAmount();
												}}
											>
												+
											</StyledRoundButton>
										</s.Container>
										<s.SpacerSmall />
										<s.Container ai={"center"} jc={"center"} fd={"row"}>
											<StyledButton
												disabled={claimingNft ? 1 : 0}
												onClick={(e) => {
													e.preventDefault();
													claimNFTs();
													getData();
												}}
											>
												{claimingNft ? "BUSY" : "BUY"}
											</StyledButton>
										</s.Container>
									</>
								)}
							</>
						)}
						<s.SpacerMedium />
					</s.Container>
					<s.SpacerLarge />
					<s.Container flex={1} jc={"center"} ai={"center"}>
						<StyledImg
							alt={"example"}
							src={"/config/images/example.png"}
							style={{ transform: "scaleX(-1)" }}
						/>
					</s.Container>
				</ResponsiveWrapper>
				<s.SpacerMedium />
				<s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
					<s.TextDescription
						style={{
							textAlign: "center",
							color: "#DC143C",
						}}
					>
						Please make sure you are connected to the right network (
						{CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
						Once you make the purchase, you cannot undo this action.
					</s.TextDescription>
					<s.SpacerSmall />
					<s.TextDescription
						style={{
							textAlign: "center",
							color: "#DC143C",
						}}
					>
						We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
						successfully mint your NFT. We recommend that you don't lower the
						gas limit.
					</s.TextDescription>
				</s.Container>
			</s.Container>
		</s.Screen>
	);
}

export default App;
