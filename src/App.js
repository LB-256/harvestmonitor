import React, { Fragment, useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import { web3, depositTime, getCurveSharePrice, getfAssetSharePrice, apiUrl, ftbtc, getTbtcFarmRewards, faBTC, aOwnership, getFarmRewards, farmDepositTime } from './Abi';
import { Table, Grid, Loader } from 'semantic-ui-react';
import { formatUnits, formatEther } from "@ethersproject/units";
import farmlogo from './farm.png';
import btclogo from './bitcoin.webp';
import {Line} from 'react-chartjs-2';

function App() {
 
  const [depTime, setDepositState] = useState(0)
  useEffect(()=> {
    const millisToMinutesAndSeconds = (miliseconds) => {
      var days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;
  
      total_seconds = parseInt(Math.floor(miliseconds / 1000));
      total_minutes = parseInt(Math.floor(total_seconds / 60));
      total_hours = parseInt(Math.floor(total_minutes / 60));
      days = parseInt(Math.floor(total_hours / 24));

      seconds = parseInt(total_seconds % 60);
      minutes = parseInt(total_minutes % 60);
      hours = parseInt(total_hours % 24);
      return { d: days, h: hours, m: minutes, s: seconds };
  }

  let deposit = millisToMinutesAndSeconds(depositTime);
  let depositFarm = millisToMinutesAndSeconds(farmDepositTime);
  setDepositState({depTime: deposit, depositFarm: depositFarm})
  
  },[setDepositState])



  const [priceData, setpriceData] = useState({
    bitcoinData: {usd: 0, usd_24h_change: 0},
    harvestData: {usd: 0, usd_24h_change: 0},
  })
  useEffect(()=> {

    const axiosData = async () => {
    try{
      const data = await axios.get(apiUrl);
      setpriceData({bitcoinData: data.data.bitcoin, harvestData: data.data['harvest-finance']})
    }catch (error) {
      console.error(error);
    }  
  }
  axiosData()
},[])
    

  const [state, setState] = useState({
    loading: true,
    curBlock: 0,
    btcUSDVal: 0,
    btcUSDCurVal: 0,
    farmUSDCurVal: 0,
    tbtcFarmRewards: 0
  });
  useEffect(() => {
    
    const getPrices = async () => {
      try {    
        
        let btcUsd = priceData.bitcoinData.usd;
        let farmUsd = priceData.harvestData.usd;
        
        const block = await web3.eth.getBlockNumber();

        const promises = [
          await getfAssetSharePrice.call({}, ), await getCurveSharePrice.call({}, ), await getTbtcFarmRewards.call({}, ), 
          await getfAssetSharePrice.call({}, block-3500), await getCurveSharePrice.call({}, block - 3500), await getTbtcFarmRewards.call({}, block-3500), 
          await getFarmRewards.call({}, ), await getFarmRewards.call({}, block-3500)]
        const [share, curveShare, tbtcFarmRewards, share1d, curveShare1d, tbtcFarmRewards1d, farmRewards, farmRewards1d] = await Promise.all(promises)
        
        console.time('a')
        let btcUSDVal = ((ftbtc * formatEther(share))*formatEther(curveShare)) //get true btc by multiplying share prices from harvest and curve
        let btcGainTotal = btcUSDVal - 1 
        let btcGainTotalUSD = (btcGainTotal*btcUsd).toFixed(2)
        let btcGainPercent = ((btcGainTotal/1)*100).toFixed(2)

        let rewardsFormat = parseFloat(formatEther(tbtcFarmRewards)) 
        let btcUSDCurVal = parseFloat((btcUSDVal*btcUsd).toFixed(2)) //true btc multipled by current price
        let farmUSDCurVal = parseFloat((rewardsFormat*farmUsd).toFixed(2))
        let farmGainPercent = ((farmUSDCurVal/btcUSDCurVal)*100).toFixed(2)

        let netProfitTotal = parseFloat(btcGainTotalUSD) + parseFloat(farmUSDCurVal)

        let btcUSDVal1d = ((ftbtc * formatEther(share1d))*formatEther(curveShare1d)) 

        let btcGainTotal1d = btcUSDVal - btcUSDVal1d
        let btcGainTotalUSD1d = (btcGainTotal1d*btcUsd).toFixed(2)
        let btcGainPercent1d = ((btcGainTotal1d/1)*100).toFixed(2)

        let rewardsFormat1d = parseFloat(formatEther(tbtcFarmRewards1d)) 
        let rewards1dDiff = (rewardsFormat - rewardsFormat1d).toFixed(6)
        let rewards1dUSDVal = (rewards1dDiff * farmUsd).toFixed(2)
        let rewards1dPercent = ((rewards1dUSDVal/(btcUSDVal*btcUsd))*100).toFixed(4)


        let farmRewardsFormat = parseFloat(formatEther(farmRewards)) 
        let farmRewardsFormat1d = parseFloat(formatEther(farmRewards1d)) 
        let farmRewardsCurVal = (farmRewardsFormat*farmUsd).toFixed(2)
        let farmRewardsTotal = (farmRewardsFormat - 7.69)
        let farmRewardsTotalUSD = (farmRewardsTotal*farmUsd).toFixed(2)
        let farmRewardsPercent = parseFloat(((farmRewardsTotalUSD/farmRewardsCurVal)*100).toFixed(2))
        let farmRewards1dChange = (farmRewardsFormat - farmRewardsFormat1d)
        let farmRewards1dChangeUSD = (farmRewards1dChange*farmUsd).toFixed(2)
        let farmRewards1dPercent = parseFloat(((farmRewards1dChangeUSD/farmRewardsCurVal)*100).toFixed(2))
        

        setState({
        btcUSDVal: btcUSDVal.toFixed(6), tbtcFarmRewards: rewardsFormat.toFixed(6), btcUSDCurVal: btcUSDCurVal, 
        farmUSDCurVal: farmUSDCurVal, btcGainTotal: btcGainTotal.toFixed(6), btcGainTotalUSD: btcGainTotalUSD, netProfitTotal: netProfitTotal.toFixed(2), btcGainPercent: btcGainPercent, farmGainPercent: farmGainPercent, 
        btcGainTotal1d: btcGainTotal1d.toFixed(6), btcGainTotalUSD1d: btcGainTotalUSD1d, btcGainPercent1d: btcGainPercent1d, rewards1dDiff: rewards1dDiff, rewards1dUSDVal: rewards1dUSDVal, rewards1dPercent: rewards1dPercent, 
        farmRewardsFormat: farmRewardsFormat.toFixed(4), farmRewardsCurVal: farmRewardsCurVal, farmRewardsTotal: farmRewardsTotal.toFixed(6), farmRewardsTotalUSD: farmRewardsTotalUSD, farmRewards1dChange: farmRewards1dChange.toFixed(6), 
        farmRewards1dChangeUSD: farmRewards1dChangeUSD, farmRewards1dPercent: farmRewards1dPercent,farmRewardsPercent: farmRewardsPercent, loading: false
        });
        console.timeEnd('a')
      }
      catch (error) {
        console.error(error);
      }  
    };

    console.log(priceData.bitcoinData.usd)
    
      getPrices();
    
      
  }, [priceData, setState]);

  


  return (
    
<div className="App">
<header className="App-header">
{state.loading === false ? 
<Fragment>
<h1>Yield Watcher</h1>
<Grid columns={2} id="grid">
    <Grid.Row>
      <Grid.Column>
      <img src={btclogo} width='30px' alt='BTC logo' /> <p>${(priceData.bitcoinData.usd).toLocaleString()}  ({priceData.bitcoinData.usd_24h_change.toFixed(2)}%)</p>
      </Grid.Column>
      <Grid.Column>
      <img src={farmlogo} width='30px' alt='Farm logo' /> <p>${priceData.harvestData.usd}  ({priceData.harvestData.usd_24h_change.toFixed(2)}%)</p>
      </Grid.Column>
    </Grid.Row>
</Grid>
          
        <h2>BTC Pool Rewards Table</h2> 
        <p>Deposited {depTime.depTime.d}d {depTime.depTime.h}h {depTime.depTime.m}m ago</p>
  <Table celled structured id="table">
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell rowSpan='2'>Rewards</Table.HeaderCell>
        <Table.HeaderCell colSpan='2'>Current Value</Table.HeaderCell>
        <Table.HeaderCell colSpan='3'>Change 1D</Table.HeaderCell>
        <Table.HeaderCell colSpan='3'>Change Since Deposit</Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>
      <Table.Row>
        <Table.Cell><img src={btclogo} width='50px' alt='BTC logo' /></Table.Cell>

        <Table.Cell>${state.btcUSDCurVal.toLocaleString()}</Table.Cell>
        <Table.Cell>{state.btcUSDVal}</Table.Cell>

        <Table.Cell>${state.btcGainTotalUSD1d}</Table.Cell>
        <Table.Cell>{state.btcGainTotal1d}</Table.Cell>
        <Table.Cell>{state.btcGainPercent1d}%</Table.Cell>

        <Table.Cell>${state.btcGainTotalUSD}</Table.Cell>
        <Table.Cell>{state.btcGainTotal}</Table.Cell>
        <Table.Cell>{state.btcGainPercent}%</Table.Cell>
      </Table.Row>  

      <Table.Row>
        <Table.Cell><img src={farmlogo} alt='Farm logo' /></Table.Cell>

        <Table.Cell colSpan='2'></Table.Cell>

        <Table.Cell>${state.rewards1dUSDVal}</Table.Cell>
        <Table.Cell>{state.rewards1dDiff}</Table.Cell>
        <Table.Cell>{state.rewards1dPercent}%</Table.Cell>

        <Table.Cell>${state.farmUSDCurVal}</Table.Cell>
        <Table.Cell>{state.tbtcFarmRewards}</Table.Cell>
        <Table.Cell>{state.farmGainPercent}%</Table.Cell>
      </Table.Row>  

      <Table.Row>
        <Table.Cell>Totals (USD)</Table.Cell>

        <Table.Cell colSpan='2' textAlign='right'>${(state.farmUSDCurVal + parseFloat(state.btcUSDCurVal)).toLocaleString()}</Table.Cell>

        <Table.Cell colSpan='3' textAlign='right'>${(parseFloat(state.rewards1dUSDVal) + parseFloat(state.btcGainTotalUSD1d)).toFixed(2)}</Table.Cell>

        <Table.Cell colSpan='3' textAlign='right'>${state.netProfitTotal}</Table.Cell>

      </Table.Row>  
    </Table.Body>
  </Table>

  <h2>Farm Profit Share Table</h2> 
  <p>Deposited {depTime.depositFarm.d}d {depTime.depositFarm.h}h {depTime.depositFarm.m}m ago</p>
  <Table celled structured id="table">
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell rowSpan='2'>Rewards</Table.HeaderCell>
        <Table.HeaderCell colSpan='2'>Current Value</Table.HeaderCell>
        <Table.HeaderCell colSpan='3'>Change 1D</Table.HeaderCell>
        <Table.HeaderCell colSpan='3'>Change Since Deposit</Table.HeaderCell>
      </Table.Row>
    </Table.Header>

    <Table.Body>
      <Table.Row>
        <Table.Cell><img src={farmlogo} alt='Farm logo' /></Table.Cell>

        <Table.Cell>${state.farmRewardsCurVal}</Table.Cell>
        <Table.Cell>{state.farmRewardsFormat}</Table.Cell>

        <Table.Cell>${state.farmRewards1dChangeUSD}</Table.Cell>
        <Table.Cell>{state.farmRewards1dChange}</Table.Cell>
        <Table.Cell>{state.farmRewards1dPercent}%</Table.Cell>

        <Table.Cell>${state.farmRewardsTotalUSD}</Table.Cell>
        <Table.Cell>{state.farmRewardsTotal}</Table.Cell>
        <Table.Cell>{state.farmRewardsPercent}%</Table.Cell>
      </Table.Row>  

    </Table.Body>
  </Table>

  </Fragment> : <Loader id="loader" content='Loading' /> }
      </header>
    </div>
  );
}

export default App;
