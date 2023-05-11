import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, SafeAreaView,StyleSheet,Text,TouchableOpacity,View } from 'react-native';

import MapView from 'react-native-map-clustering'
import CustomMarker from './components/CustomMarker';
import { getDistance } from 'geolib';
import MapTypes from 'react-native-maps'



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
interface IClosedStore extends IRstr {
  distance: number;
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
  
  const mapRef = useRef<MapTypes>(null);
  const flatlistRef = useRef<FlatList<IClosedStore>>(null);
  const [busanInfo,setBusanInfo] = useState<IBusanInfo>();
  const [filterTargetCloseStore, setFilterTargetCloseStore] = useState<IClosedStore[]>([]);
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
    const getCloseStore = useCallback((target:IRstr[], item: IRstr, dt: number) => {
      setCurrentMarker(() => item)
      if(currentMarker?.RSTR_ID === item.RSTR_ID) return; 
      
      const closeStore = target.map((place) => {
        const computedDistance = getDistance({ latitude: item.RSTR_LA, longitude: item.RSTR_LO }, { latitude: place.RSTR_LA, longitude: place.RSTR_LO })
        if(place.RSTR_ID !== item.RSTR_ID && computedDistance <= dt){
          return {
            ...place,
            distance: computedDistance
          }
        }
      }).filter((store) => store !== undefined);
      
      setFilterTargetCloseStore(() => closeStore as IClosedStore[])
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
          ref={flatlistRef}
          style={{position:'absolute', bottom:0, width:'100%'}}
          horizontal
          contentContainerStyle={{paddingHorizontal:10,paddingVertical:4}}
          data={filterTargetCloseStore}
          keyExtractor={(item) => item.RSTR_ID}
          renderItem={({item}) => (
          <TouchableOpacity
            style={{padding:10, minWidth:120, height: 120, justifyContent:'center',borderWidth:1, borderRadius: 16, borderColor:'#2d63e2',backgroundColor:'#fff'}}
            onPress={() => {
              if(!flatlistRef.current) return;
              flatlistRef.current.scrollToIndex({index:0, animated:true})
              if(!mapRef.current || !busanInfo) return;
                mapRef.current.animateToRegion(
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
              <Text style={{color:'#ccc'}}>{item.distance}M</Text>
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
