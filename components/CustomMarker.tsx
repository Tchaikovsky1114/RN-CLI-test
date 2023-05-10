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


// CustomMarkerRef is to be partial of MapMarker
export interface CustomMarkerRef {
  showCallout: () => void;
}
// use type of MutableRef<T, undefined> (type.3)
// forwardRef<CustomMarkerRef | null, Props>(
const CustomMarker = (props:Props) => {
  const { item, pinColor, opacity, getCloseStore, busanInfo, coordinate } = props;
  // unnecessary useRef and wrong method
  // const markerRef: RefObject<MapMarker> = useRef<MapMarker>(null);
  // throw error. that hooks realonly 
  // useImperativeHandle(ref, () => ({
  //   showCallout: () => {
      
  //       setTimeout(() => {
  //         if (markerRef.current) {
  //         markerRef.current.showCallout();
  //         console.log('showCallout excute');
  //         }
  //       },500)
        
      
  //   },
  // }));


  return (
      <Marker
          // ref={markerRef}
          pinColor={pinColor}
          opacity={opacity}
          coordinate={coordinate}
          tracksViewChanges={false}
          onPress={() => {
            // issue 1.타겟의 반경 100m 이내의 마커를 클릭 했을 때 callout이 사라지는 현상
            // 마커를 클릭했을 때 filterTargetCloseStore에 들어있는 식당 정보라면.. 어떤 처리를 해줘야 할 것 같음..
            // 마커의 id가 inactive에서 active로 바뀌면서 마커가 교체됨
            // 교체되고 나서 callout을 띄워야하나 마커가 완전히 사라지는 부분이라 타겟으로 잡을 수 없어 구현이 어려움...

            getCloseStore(busanInfo.rstr, item, 100); 
            
          }}
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
