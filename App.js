import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Animatable from 'react-native-animatable';

const COLORS = ['#e74c3c', '#8e44ad', '#3498db', '#27ae60', '#f1c40f', '#d35400', '#2c3e50', '#95a5a6'];

const App = () => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [start, setStart] = useState(null);
  const [areaPoints, setAreaPoints] = useState([]);
  const [areaName, setAreaName] = useState('');
  const [areaColor, setAreaColor] = useState(COLORS[0]);
  const [areas, setAreas] = useState([]);

  const handleDrawArea = () => {
    if (drawingMode) {
      setDrawingMode(false);
    } else {
      setDrawingMode(true);
    }
  };

  const handleMarkerPress = (index) => {
    if (drawingMode && index !== 0) {
      const newAreaPoints = [...areaPoints];
      newAreaPoints.splice(index, 1);
      setAreaPoints(newAreaPoints);
    }
  };

  const handleMarkerDrag = (coordinate, index) => {
    if (drawingMode) {
      const newAreaPoints = [...areaPoints];
      if (index === 0) {
        setStart(coordinate);
        newAreaPoints[0] = coordinate;
      } else {
        newAreaPoints[index] = coordinate;
      }
      setAreaPoints(newAreaPoints);
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
      setStart(null);
      setAreaPoints([]);
      setDrawingMode(false);
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

  const handleTurnOnRobot = () => {
    // Lógica para ligar o robô
  };

  const handleTurnOffRobot = () => {
    // Lógica para desligar o robô
  };

  const handleGoToBase = () => {
    // Lógica para fazer o robô voltar à base
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInLeft" duration={500} style={styles.sidebar}>
        <TouchableOpacity onPress={handleDrawArea} style={styles.button}>
          <Text style={styles.buttonText}>{drawingMode ? 'Concluir Área' : 'Desenhar Área'}</Text>
        </TouchableOpacity>
        {drawingMode && (
          <>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={handleReturnToBase}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Nome da Área:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome da área"
              value={areaName}
              onChangeText={(text) => setAreaName(text)}
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
          </>
        )}
        <TouchableOpacity style={[styles.button, { backgroundColor: '#2ecc71' }]} onPress={handleSaveArea}>
          <Text style={styles.buttonText}>Salvar Área</Text>
        </TouchableOpacity>
        <Text style={styles.label}>Áreas Salvas:</Text>
        <FlatList
          data={areas}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.areaItem, { backgroundColor: item.color }]}
              onPress={() => handleEditArea(index)}
            >
              <Text style={styles.areaItemText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: '#27ae60' }]} onPress={handleTurnOnRobot}>
          <Text style={styles.buttonText}>Ligar Robô</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={handleTurnOffRobot}>
          <Text style={styles.buttonText}>Desligar Robô</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#f1c40f' }]} onPress={handleGoToBase}>
          <Text style={styles.buttonText}>Voltar à Base</Text>
        </TouchableOpacity>
      </Animatable.View>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: -15.6014105,
            longitude: -47.7097587,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          onPress={handleMapPress}
          mapType="satellite"
        >
          {start && (
            <Marker
              coordinate={start}
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
              fillColor={areaColor + '40'} // Adiciona transparência (alfa) à cor
              strokeWidth={2}
            />
          )}
        </MapView>
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
    paddingVertical: 40,
  },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  areaItem: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  areaItemText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mapContainer: {
    flex: 4,
  },
  map: {
    flex: 1,
  },
});

export default App;
