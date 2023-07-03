import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Animatable from 'react-native-animatable';

const App = () => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [base, setBase] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [areaWidth, setAreaWidth] = useState(null);
  const [areaHeight, setAreaHeight] = useState(null);
  const [areaPoints, setAreaPoints] = useState([]);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      } else if (status === 'denied') {
        console.log('Permissão de localização negada');
      } else if (status === 'undetermined') {
        console.log('Permissão de localização não solicitada anteriormente');
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    if (areaPoints.length >= 3) {
      const width = Math.abs(areaPoints[1].latitude - areaPoints[0].latitude) * 111000; // Convertendo a diferença em latitude para metros
      const height = Math.abs(areaPoints[1].longitude - areaPoints[0].longitude) * 111000; // Convertendo a diferença em longitude para metros
      setAreaWidth(width);
      setAreaHeight(height);
    } else {
      setAreaWidth(null);
      setAreaHeight(null);
    }
  }, [areaPoints]);

  const handleDrawArea = () => {
    setDrawingMode(!drawingMode);
    setAreaPoints([]);
  };

  const handleMarkerPress = (markerIndex) => {
    if (drawingMode) {
      if (markerIndex === 0) {
        setStart(null);
        setAreaPoints([]);
      } else if (markerIndex === areaPoints.length - 1) {
        const newAreaPoints = [...areaPoints];
        newAreaPoints.pop();
        setAreaPoints(newAreaPoints);
      }
    }
  };

  const handleMarkerDrag = (coordinate, markerIndex) => {
    if (drawingMode) {
      if (markerIndex === 0) {
        setStart(coordinate);
      } else if (markerIndex === areaPoints.length - 1) {
        const newAreaPoints = [...areaPoints];
        newAreaPoints.pop();
        newAreaPoints.push(coordinate);
        setAreaPoints(newAreaPoints);
      }
    }
  };

  const handleMapPress = ({ nativeEvent: { coordinate } }) => {
    if (drawingMode) {
      if (!start) {
        setStart(coordinate);
        setAreaPoints([coordinate]);
      } else {
        const newAreaPoints = [...areaPoints];
        newAreaPoints.push(coordinate);
        setAreaPoints(newAreaPoints);
      }
    }
  };

  const handleReturnToBase = () => {
    if (drawingMode) {
      setStart(null);
      setEnd(null);
      setBase(null);
      setAreaPoints([]);
      setDrawingMode(false);
    }
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInLeft" duration={500} style={styles.sidebar}>
        <TouchableOpacity onPress={handleDrawArea} style={styles.button}>
          <Text style={styles.buttonText}>{drawingMode ? 'Concluir Área' : 'Desenhar Área'}</Text>
        </TouchableOpacity>
        {drawingMode && (
          <>
            <TouchableOpacity style={styles.button} onPress={handleReturnToBase}>
              <Text style={styles.buttonText}>Retornar à Base</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Ligar Robô</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Desligar Robô</Text>
            </TouchableOpacity>
          </>
        )}
      </Animatable.View>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          onPress={handleMapPress}
          initialRegion={{
            latitude: -15.6336, // Latitude de Planaltina
            longitude: -47.6036, // Longitude de Planaltina
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {start && (
            <Marker
              coordinate={start}
              onPress={() => handleMarkerPress(0)}
              draggable={drawingMode}
              onDragEnd={({ nativeEvent }) => handleMarkerDrag(nativeEvent.coordinate, 0)}
            />
          )}
          {areaPoints.map((point, index) => (
            <Marker
              key={index}
              coordinate={point}
              onPress={() => handleMarkerPress(index)}
              draggable={drawingMode}
              onDragEnd={({ nativeEvent }) => handleMarkerDrag(nativeEvent.coordinate, index)}
            />
          ))}
          {start && areaPoints.length >= 2 && (
            <Polygon
              coordinates={[start, ...areaPoints, areaPoints[0]]}
              fillColor="rgba(204, 0, 0, 0.4)"
              strokeColor="#FFCC00"
              strokeWidth={2}
            />
          )}
        </MapView>
      </View>
      {areaWidth && areaHeight && (
        <Animatable.View animation="fadeInUp" duration={500} style={styles.areaInfoContainer}>
          <Text style={styles.areaInfoText}>
            Tamanho da Área: {areaWidth.toFixed(2)} m x {areaHeight.toFixed(2)} m
          </Text>
        </Animatable.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
  },
  sidebar: {
    width: 120,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    marginVertical: 10,
    paddingVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  areaInfoContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  areaInfoText: {
    color: 'white',
    fontSize: 16,
  },
});

export default App;
