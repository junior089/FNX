import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Animatable from 'react-native-animatable';

const COLORS = [
  'rgba(255, 0, 0, 0.4)',
  'rgba(0, 255, 0, 0.4)',
  'rgba(0, 0, 255, 0.4)',
  'rgba(255, 255, 0, 0.4)',
  'rgba(255, 0, 255, 0.4)',
  'rgba(0, 255, 255, 0.4)',
  'rgba(128, 0, 0, 0.4)',
  'rgba(0, 128, 0, 0.4)',
];

const App = () => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [start, setStart] = useState(null);
  const [areaPoints, setAreaPoints] = useState([]);
  const [areas, setAreas] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [areaWidth, setAreaWidth] = useState(null);
  const [areaHeight, setAreaHeight] = useState(null);
  const [areaName, setAreaName] = useState('');
  const [areaColor, setAreaColor] = useState(COLORS[0]);

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
      setAreaPoints([]);
      setDrawingMode(false);
    }
  };

  const handleSaveArea = () => {
    if (areaPoints.length >= 3 && areaName !== '') {
      const newArea = {
        name: areaName,
        points: areaPoints,
        color: areaColor,
      };

      setAreas([...areas, newArea]);
      setAreaName('');
      setAreaColor(COLORS[0]);
      handleReturnToBase();
    }
  };

  const handleEditArea = (index) => {
    const area = areas[index];
    setAreaName(area.name);
    setAreaColor(area.color);
    setDrawingMode(true);
    setAreaPoints(area.points);
    setAreas(areas.filter((_, i) => i !== index));
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
            <TextInput
              style={styles.input}
              placeholder="Nome da Área"
              value={areaName}
              onChangeText={setAreaName}
            />
            <Text style={styles.label}>Cor da Área:</Text>
            <View style={styles.colorPalette}>
              {COLORS.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                  onPress={() => setAreaColor(color)}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSaveArea}>
              <Text style={styles.buttonText}>Salvar Área</Text>
            </TouchableOpacity>
          </>
        )}
        <Text style={styles.label}>Áreas Salvas:</Text>
        <FlatList
          data={areas}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.areaItem, { backgroundColor: item.color }]}
              onPress={() => handleEditArea(index)}
            >
              <Text style={styles.areaItemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
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
              draggable={true}
              onDrag={(e) => handleMarkerDrag(e.nativeEvent.coordinate, 0)}
            />
          )}
          {areaPoints.map((point, index) => (
            <Marker
              key={index}
              coordinate={point}
              onPress={() => handleMarkerPress(index + 1)}
              draggable={true}
              onDrag={(e) => handleMarkerDrag(e.nativeEvent.coordinate, index + 1)}
            />
          ))}
          {areaPoints.length >= 3 && (
            <Polygon
              coordinates={areaPoints}
              strokeColor={areaColor}
              fillColor={areaColor}
              strokeWidth={2}
              fillOpacity={0.4}
            />
          )}
        </MapView>
        {areaWidth && areaHeight && (
          <View style={styles.areaDimensions}>
            <Text style={styles.areaDimensionsText}>
              Largura: {areaWidth.toFixed(2)} metros | Altura: {areaHeight.toFixed(2)} metros
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    margin: 5,
    borderRadius: 15,
  },
  mapContainer: {
    flex: 4,
  },
  map: {
    flex: 1,
  },
  areaDimensions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  areaDimensionsText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  areaItem: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  areaItemText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default App;
