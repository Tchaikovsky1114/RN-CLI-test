import { Text, View } from 'react-native'
import  { memo } from 'react'
import { Callout, Marker } from 'react-native-maps'


interface Props {
  item: any;
  pinColor: string;
  opacity: number;
  getCloseStore: any;
  busanInfo: any;
  coordinate: any;  
}


// ** 마커 클릭 후 모달을 띄울 때 자연스러운 랜더링을 위해 useTransition을 사용한다.

const CustomMarker = (props:Props) => {
  const { item, pinColor, opacity, getCloseStore, busanInfo, coordinate } = props;

  return (
      <Marker
          pinColor={pinColor}
          opacity={opacity}
          coordinate={coordinate}
          tracksViewChanges={false}
          onPress={() => getCloseStore(busanInfo.rstr, item, 100)}
        >        
        <Callout tooltip>
          <View style={{ padding:12, backgroundColor:'#2d63e2',borderRadius: 12}}>
            <Text style={{color:'#fff'}}>{item.RSTR_NM} ({item.BSNS_STATM_BZCND_NM})</Text>
            <Text style={{color:'#fff'}}>{item.RSTR_RDNMADR}</Text>
          </View>
        </Callout>
        </Marker>
  )
}

export default memo(CustomMarker)
