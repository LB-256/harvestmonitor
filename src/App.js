import React, { Fragment, useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import { web3, depositTime, getCurveSharePrice, getfAssetSharePrice, apiUrl, ftbtc, getFarmRewards, farmDepositTime, startaBTC, startdBTC } from './Abi';
import { Table, Grid, Loader, Icon } from 'semantic-ui-react';
import { formatEther } from "@ethersproject/units";
import farmlogo from './farm.png';
import btclogo from './bitcoin.webp';
import badgerlogo from './badger.webp';
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
    

  const [state, setState] = useState({
    loading: true,
    curBlock: 0,
    btcUSDVal: 0,
    btcUSDCurVal: 0,
    farmUSDCurVal: 0,
    tbtcFarmRewards: 0,
    bitcoinData: {usd: 0, usd_24h_change: 0},
    badgerData: {usd: 0, usd_24h_change: 0},
    harvestData: {usd: 0, usd_24h_change: 0}
  });
  useEffect(() => {


    const getPrices = async () => {
      try {    

        console.time('a')

        const block = await web3.eth.getBlockNumber();
          const promises = [
            await axios.get(apiUrl),
            await getfAssetSharePrice.call({}, ), 
            await getCurveSharePrice.call({}, ), 
            await getfAssetSharePrice.call({}, block-3500), 
            await getCurveSharePrice.call({}, block-3500), 
            await getFarmRewards.call({}, ), 
            await getFarmRewards.call({}, block-3500)]
          const [data, share, curveShare, share1d, curveShare1d, farmRewards, farmRewards1d] = await Promise.all(promises) 
        
        let btcUsd = data.data.bitcoin.usd;
        let farmUsd = data.data['harvest-finance'].usd;
        let badgerusd = data.data['badger-dao'].usd;
        
        let btcUSDVal = ((ftbtc * formatEther(share))*formatEther(curveShare)) //get true btc by multiplying share prices from harvest and curve
        let btcGainTotal = btcUSDVal - 1 
        let btcUSDCurVal = parseFloat((btcUSDVal*btcUsd).toFixed(2)) //true btc multipled by current price
        let btcGainTotalUSD = (btcGainTotal*btcUsd).toFixed(2)
        let btcGainPercent = ((btcGainTotal/1)*100).toFixed(2)
        let btcDataObj = {btcUSDVal: btcUSDVal.toFixed(6)}
        
        
        let btcUSDVal1d = ((ftbtc * formatEther(share1d))*formatEther(curveShare1d)) 
        let btcGainTotal1d = btcUSDVal - btcUSDVal1d
        let btcGainTotalUSD1d = (btcGainTotal1d*btcUsd).toFixed(2)
        let btcGainPercent1d = ((btcGainTotal1d/1)*100).toFixed(4)


        let farmRewardsFormat = parseFloat(formatEther(farmRewards)) 
        let farmRewardsFormat1d = parseFloat(formatEther(farmRewards1d)) 
        let farmRewardsCurVal = (farmRewardsFormat*farmUsd).toFixed(2)
        let farmRewardsTotal = (farmRewardsFormat - 8.202514933085391703)
        let farmRewardsTotalUSD = (farmRewardsTotal*farmUsd).toFixed(2)
        let farmRewardsPercent = parseFloat(((farmRewardsTotalUSD/farmRewardsCurVal)*100).toFixed(2))
        let farmRewards1dChange = (farmRewardsFormat - farmRewardsFormat1d)
        let farmRewards1dChangeUSD = (farmRewards1dChange*farmUsd).toFixed(2)
        let farmRewards1dPercent = parseFloat(((farmRewards1dChangeUSD/farmRewardsCurVal)*100).toFixed(2))
        
        

        setState({bitcoinData: data.data.bitcoin, harvestData: data.data['harvest-finance'], badgerData: data.data['badger-dao'], btcDataObj: btcDataObj,
        btcGainTotal: btcGainTotal.toFixed(6), btcGainTotalUSD: btcGainTotalUSD, btcGainPercent: btcGainPercent, btcUSDCurVal: btcUSDCurVal,
        btcGainTotal1d: btcGainTotal1d.toFixed(6), btcGainTotalUSD1d: btcGainTotalUSD1d, btcGainPercent1d: btcGainPercent1d,
        farmRewardsFormat: farmRewardsFormat.toFixed(4), farmRewardsCurVal: farmRewardsCurVal, farmRewardsTotal: farmRewardsTotal.toFixed(6), 
        farmRewardsTotalUSD: farmRewardsTotalUSD, farmRewards1dChange: farmRewards1dChange.toFixed(6), 
        farmRewards1dChangeUSD: farmRewards1dChangeUSD, farmRewards1dPercent: farmRewards1dPercent,farmRewardsPercent: farmRewardsPercent, loading: false
        });
        console.timeEnd('a')
      }
      catch (error) {
        console.error(error);
      }  
    };
    
      getPrices();
    
      
  }, [setState]);

  


  return (
    
<div className="App">
<header className="App-header">
{state.loading === false ? 
<Fragment>
<h1>Yield Watcher</h1>

<Grid columns={3} id="grid">
    <Grid.Row>
      <Grid.Column>
      <img src={btclogo} width='30px' alt='BTC logo' /> <p>${(state.bitcoinData.usd).toLocaleString()}  ({state.bitcoinData.usd_24h_change.toFixed(2)}%)</p>
      </Grid.Column>
      <Grid.Column>
      <img src={farmlogo} width='30px' alt='Farm logo' /> <p>${state.harvestData.usd}  ({state.harvestData.usd_24h_change.toFixed(2)}%)</p>
      </Grid.Column>
      <Grid.Column>
      <img src={badgerlogo} width='30px' alt='Badger logo' /> <p>${(state.badgerData.usd).toLocaleString()}  ({state.badgerData.usd_24h_change.toFixed(2)}%)</p>
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
        <Table.Cell>{state.btcDataObj.btcUSDVal}</Table.Cell>

        <Table.Cell>${state.btcGainTotalUSD1d}</Table.Cell>
        <Table.Cell>{state.btcGainTotal1d}</Table.Cell>
        <Table.Cell>{state.btcGainPercent1d}%</Table.Cell>

        <Table.Cell>${state.btcGainTotalUSD}</Table.Cell>
        <Table.Cell>{state.btcGainTotal}</Table.Cell>
        <Table.Cell>{state.btcGainPercent}%</Table.Cell>
      </Table.Row>  

      <Table.Row>
        <Table.Cell>A</Table.Cell>

        <Table.Cell>${(state.btcUSDCurVal*startaBTC).toFixed(2)}</Table.Cell>
        <Table.Cell>{(state.btcDataObj.btcUSDVal*startaBTC).toFixed(6)}</Table.Cell>

        <Table.Cell>${(state.btcGainTotalUSD1d*startaBTC).toFixed(2)}</Table.Cell>
        <Table.Cell>{(state.btcGainTotal1d*startaBTC).toFixed(6)}</Table.Cell>
        <Table.Cell>{(state.btcGainPercent1d*startaBTC).toFixed(4)}%</Table.Cell>

        <Table.Cell>${(state.btcGainTotalUSD*startaBTC).toFixed(2)}</Table.Cell>
        <Table.Cell>{(state.btcGainTotal*startaBTC).toFixed(6)}</Table.Cell>
        <Table.Cell>{(state.btcGainPercent*startaBTC).toFixed(4)}%</Table.Cell>
      </Table.Row> 

      <Table.Row>
        <Table.Cell>D</Table.Cell>

        <Table.Cell>${(state.btcUSDCurVal*startdBTC).toFixed(2)}</Table.Cell>
        <Table.Cell>{(state.btcDataObj.btcUSDVal*startdBTC).toFixed(6)}</Table.Cell>

        <Table.Cell>${(state.btcGainTotalUSD1d*startdBTC).toFixed(2)}</Table.Cell>
        <Table.Cell>{(state.btcGainTotal1d*startdBTC).toFixed(6)}</Table.Cell>
        <Table.Cell>{(state.btcGainPercent1d*startdBTC).toFixed(4)}%</Table.Cell>

        <Table.Cell>${(state.btcGainTotalUSD*startdBTC).toFixed(2)}</Table.Cell>
        <Table.Cell>{(state.btcGainTotal*startdBTC).toFixed(6)}</Table.Cell>
        <Table.Cell>{(state.btcGainPercent*startdBTC).toFixed(4)}%</Table.Cell>
      </Table.Row>  

      {/*<Table.Row>
        <Table.Cell>Totals (USD)</Table.Cell>

        <Table.Cell colSpan='2' textAlign='right'>${(state.farmUSDCurVal + parseFloat(state.btcUSDCurVal)).toLocaleString()}</Table.Cell>

        <Table.Cell colSpan='3' textAlign='right'>${(parseFloat(state.rewards1dUSDVal) + parseFloat(state.btcGainTotalUSD1d)).toFixed(2)}</Table.Cell>

        <Table.Cell colSpan='3' textAlign='right'>${state.netProfitTotal}</Table.Cell>

      </Table.Row> */}
    </Table.Body>
  </Table>
{/*
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
</Table>*/}

  </Fragment> : <Loader id="loader" content='Loading' /> }
      </header>
    </div>
  );
}

export default App;
