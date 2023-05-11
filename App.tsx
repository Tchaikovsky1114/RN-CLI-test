import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import MapView from 'react-native-map-clustering';
import CustomMarker from './components/CustomMarker';
import { getDistance } from 'geolib';
import MapTypes from 'react-native-maps';

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

interface IRstrImage {
  RSTR_ID: string;
  RSTR_IMG_URL: string;
  RSTR_NM: string;
  AREA_NM: string;
}

function App(): JSX.Element {
  const [location, _setLocation] = useState({
    latitude: 35.1607,
    longitude: 129.1124,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const mapRef = useRef<MapTypes>(null);
  const flatlistRef = useRef<FlatList<IClosedStore>>(null);
  const [busanInfo, setBusanInfo] = useState<IBusanInfo>();
  const [filterTargetCloseStore, setFilterTargetCloseStore] = useState<
    IClosedStore[]
  >([]);
  const [currentMarker, setCurrentMarker] = useState<IRstr>();
  const [rstrImage, setRstrImage] = useState<IRstrImage[]>([]);
  const [modalrstrName, setModalrstrName] = useState('');
  /**
   * @description : 부산광역시 식당 정보를 가져온다.
   * @pageNumber : 1에서 7페이지까지 존재
   * @param serviceKey : API 키
   * @param pageNo : 페이지 번호
   */
  const getBusanRstrInfo = async () => {
    const response = await fetch(
      'https://busan-7beach.openapi.redtable.global/api/rstr?serviceKey=QortEntQF9x0RrVxVViYFIHX2DIWAPGcIplN9nWxPsMWRovcwxHz0JkvQ0caYtaW&pageNo=1'
    );
    const data = await response.json();
    setBusanInfo({
      totalCount: data.header.totalCount,
      rstr: data.body,
    });
  };

  const getRstrImageInfo = async () => {
    const response = await fetch(
      'https://busan-7beach.openapi.redtable.global/api/rstr/img?serviceKey=QortEntQF9x0RrVxVViYFIHX2DIWAPGcIplN9nWxPsMWRovcwxHz0JkvQ0caYtaW&pageNo=1'
    );
    const data = await response.json();
    setRstrImage(data.body.splice(0, 10));
  };

  const renderMarkers = useCallback(() => {
    if (!busanInfo) return;
    return busanInfo.rstr.map((item) => {
      const isActive = filterTargetCloseStore?.find(
        (place) => place.RSTR_ID === item.RSTR_ID
      );
      return (
        <CustomMarker
          key={`${item.RSTR_ID}-${isActive ? 'active' : 'inactive'}`}
          busanInfo={busanInfo}
          pinColor={isActive ? 'red' : 'blue'}
          opacity={
            isActive || currentMarker?.RSTR_ID === item.RSTR_ID ? 1 : 0.3
          }
          item={item}
          getCloseStore={getCloseStore}
          coordinate={{
            latitude: +item.RSTR_LA,
            longitude: +item.RSTR_LO,
          }}
        />
      );
    });
  }, [busanInfo, filterTargetCloseStore, currentMarker]);

  /**
   * distance 이내의 식당을 가져온다.
   * @param target : 식당 정보가 담긴 Object Array
   * @param item : 현재 선택된 식당
   * @param distance : 거리(Meter)
   * @filterTargetCloseStore : distance 이내의 식당 정보가 담긴 Object Array
   */
  const getCloseStore = useCallback(
    (target: IRstr[], item: IRstr, dt: number) => {
      setCurrentMarker(() => item);
      if (currentMarker?.RSTR_ID === item.RSTR_ID) return;
      const closeStore = target
        .map((place) => {
          const computedDistance = getDistance(
            { latitude: item.RSTR_LA, longitude: item.RSTR_LO },
            { latitude: place.RSTR_LA, longitude: place.RSTR_LO }
          );
          if (place.RSTR_ID !== item.RSTR_ID && computedDistance <= dt) {
            return {
              ...place,
              distance: computedDistance,
            };
          }
        })
        .filter((store) => store !== undefined);

      setFilterTargetCloseStore(() => closeStore as IClosedStore[]);
    },
    [currentMarker]
  );

  useEffect(() => {
    getBusanRstrInfo();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
        region={location}
        loadingEnabled
        clusteringEnabled
        clusterColor="#4c7ae7"
        minPoints={4}
        zoomControlEnabled={false}
        animationEnabled
      >
        {renderMarkers()}
      </MapView>
      <Modal
        visible={rstrImage && rstrImage.length > 0}
        onRequestClose={() => setRstrImage([])}
      >
        <TouchableOpacity
          onPress={() => setRstrImage([])}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                width: '90%',
                height: '50%',
                backgroundColor: '#fff',
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View onStartShouldSetResponder={() => true}>
                <Text style={{ fontSize: 40 }}>{modalrstrName}</Text>

                <ScrollView
                  horizontal
                  style={{ flex: 1, height: 180, backgroundColor: '#2d63e2' }}
                  contentContainerStyle={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    alignItems: 'center',
                  }}
                >
                  {rstrImage.map((item) => (
                    <View
                      key={item.RSTR_IMG_URL}
                      onStartShouldSetResponder={() => true}
                    >
                      <Image
                        source={{ uri: item.RSTR_IMG_URL }}
                        style={{ width: 100, height: 100, marginRight: 8 }}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      <FlatList
        ref={flatlistRef}
        style={{ position: 'absolute', bottom: 0, width: '100%' }}
        horizontal
        contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 4 }}
        data={filterTargetCloseStore}
        keyExtractor={(item) => item.RSTR_ID}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{
              padding: 10,
              minWidth: 120,
              height: 120,
              justifyContent: 'center',
              borderWidth: 1,
              borderRadius: 16,
              borderColor: '#2d63e2',
              backgroundColor: '#fff',
            }}
            onPress={async () => {
              if (!flatlistRef.current) return;
              flatlistRef.current.scrollToIndex({ index: 0, animated: true });
              if (!mapRef.current || !busanInfo) return;
              mapRef.current.animateToRegion(
                {
                  latitude: +item.RSTR_LA,
                  longitude: +item.RSTR_LO,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                },
                100
              );
              getCloseStore(busanInfo.rstr, item, 100);
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Text>{item.RSTR_NM}</Text>
              <Text style={{ color: '#ccc' }}>{item.distance}M</Text>
            </View>
            <TouchableWithoutFeedback>
              <TouchableOpacity
                style={{ padding: 6, borderWidth: 1, marginTop: 8 }}
                onPress={() => {
                  getRstrImageInfo();
                  setModalrstrName(item.RSTR_NM);
                }}
              >
                <Text>가게 상세보기</Text>
              </TouchableOpacity>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
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
