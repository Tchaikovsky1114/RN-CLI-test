import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, SafeAreaView,StyleSheet,Text,TouchableOpacity,View } from 'react-native';

import MapView from 'react-native-map-clustering'
import CustomMarker from './components/CustomMarker';
import { getDistance } from 'geolib';
// import { MapMarker } from 'react-native-maps';

interface IRstr {
  RSTR_ID: string;
  RSTR_NM: string;
  RSTR_TELNO: string;
  RSTR_ADDR: string;
  RSTR_XCNTS: string;
  RSTR_YDNTS: string;
  RSTR_TYPE: string;
  RSTR_LA: string;
  RSTR_LO: string;
}

interface IBusanInfo {
  totalCount: number;
  rstr: Array<IRstr>;
}


function App(): JSX.Element {
  const [location, _setLocation] = useState({
    latitude: 35.1607000,
    longitude: 129.1124000,
    latitudeDelta: 0.05,
    longitudeDelta:0.05,
  });
  const mapRef = useRef<any>(null);
  const flatlistRef = useRef<FlatList>(null);
  // RefObject로 정의되어 generic Overloading type 2.readonly(current의 값을 수정할 수 없음)
  // modify MutableRefObject<T, undefind>[]
  // don't init any value if it has any value, typescript throw error
  // because of useRef type3 only have undefined of init value
  // if you want to init value for component mount,
  // don't use type casting. do define type
  // const markerRefs = useRef<Array<React.RefObject<MapMarker>>>([]);
  const [busanInfo,setBusanInfo] = useState<IBusanInfo>();
  const [filterTargetCloseStore, setFilterTargetCloseStore] = useState<IRstr[]>([]);
  const [currentMarker,setCurrentMarker] = useState<IRstr>();
  
 
  /**
   * @description : 부산광역시 식당 정보를 가져온다.
   * @pageNumber : 1에서 7페이지까지 존재
   * @param serviceKey : API 키
   * @param pageNo : 페이지 번호
   */
  const getBusanRstrInfo = async() => {
    const response = await fetch('https://busan-7beach.openapi.redtable.global/api/rstr?serviceKey=QortEntQF9x0RrVxVViYFIHX2DIWAPGcIplN9nWxPsMWRovcwxHz0JkvQ0caYtaW&pageNo=1');
    const data = await response.json();
    setBusanInfo({
      totalCount: data.header.totalCount,
      rstr: data.body
    })
  }

  const renderMarkers = useCallback(() => {
    if(!busanInfo) return;
    return busanInfo.rstr.map((item) => {
      const isActive = filterTargetCloseStore?.find((place) => place.RSTR_ID === item.RSTR_ID);
      // immutable value를 markerRef에 할당
      // if(!markerRefs.current[index]) markerRefs.current[index] = React.createRef();
      // const markerRef = markerRefs.current[index];
      
      return <CustomMarker
                key={`${item.RSTR_ID}-${isActive ? 'active' : 'inactive'}`}
                busanInfo={busanInfo}
                pinColor={isActive ? 'red' : 'blue'}
                opacity={isActive || currentMarker?.RSTR_ID === item.RSTR_ID ? 1 : 0.3}
                item={item}
                getCloseStore={getCloseStore}
                coordinate={{
                  latitude: +item.RSTR_LA,
                  longitude: +item.RSTR_LO
                }}
                // throw error. it is not MutableRef(type.3)
                // ref={markerRef}
              />
    })
  },[busanInfo,filterTargetCloseStore,currentMarker])


      /**
       * distance 이내의 식당을 가져온다.
       * @param target : 식당 정보가 담긴 Object Array
       * @param item : 현재 선택된 식당
       * @param distance : 거리(Meter)
       * @filterTargetCloseStore : distance 이내의 식당 정보가 담긴 Object Array
       */
    const getCloseStore = useCallback((target:IRstr[], item: IRstr, distance: number) => {
      setCurrentMarker(() => item)
      if(currentMarker?.RSTR_ID === item.RSTR_ID) return; 
      const closeStore = target.filter((place) => {
        if(place.RSTR_ID === item.RSTR_ID) return;
        return getDistance({ latitude: item.RSTR_LA, longitude: item.RSTR_LO }, { latitude: place.RSTR_LA, longitude: place.RSTR_LO }) <= distance
      })
      setFilterTargetCloseStore(() => closeStore)
  },[currentMarker])

  useEffect(() => {
    getBusanRstrInfo()
  },[])
  
  return (
    <SafeAreaView style={styles.container}>
        <MapView
          ref={mapRef}
          style={{width:'100%', height:'100%'}}
          region={location}
          loadingEnabled
          clusteringEnabled
          clusterColor='#4c7ae7'
          minPoints={4}
          zoomControlEnabled={false}
          animationEnabled
          >
            {renderMarkers()}
          </MapView>
          <FlatList
          style={{position:'absolute', bottom:0, width:'100%'}}
          horizontal
          contentContainerStyle={{paddingHorizontal:10,paddingVertical:4}}
          data={filterTargetCloseStore}
          keyExtractor={(item) => item.RSTR_ID}
          renderItem={({item,index}) => (
          <TouchableOpacity
            style={{padding:10, minWidth:120, height: 120, justifyContent:'center',borderWidth:1, borderRadius: 16, borderColor:'#2d63e2',backgroundColor:'#fff'}}
            onPress={() => {
              if(!flatlistRef.current) return;
              flatlistRef.current.scrollToIndex({index, animated:true})
              console.log(item)
              // flatlist를 첫번째 인덱스에 맞춤으로 옮겨줘야 함
              if(!mapRef.current || !busanInfo) return;
                mapRef.current?.animateToRegion(
                {
                  latitude:+item.RSTR_LA,
                  longitude:+item.RSTR_LO,
                  latitudeDelta: 0.002 ,
                  longitudeDelta: 0.002 ,
                },
                100
              );
              getCloseStore(busanInfo.rstr,item, 100)
            }}
            >
            <View style={{alignItems:'center'}}>
              <Text>{item.RSTR_NM}</Text>
            </View>
          </TouchableOpacity>)
          }
          ItemSeparatorComponent={() => <View style={{width:10}}/>}
          />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontWeight: 'bold',
    fontSize: 46,
    color: '#222',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
