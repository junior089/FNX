import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, FlatList } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';
import * as Animatable from 'react-native-animatable';

const COLORS = ['#e74c3c', '#8e44ad', '#3498db', '#27ae60', '#f1c40f', '#d35400', '#2c3e50', '#95a5a6'];

const App = () => {
  const [drawingMode, setDrawingMode] = useState(false);
  const [area, setArea] = useState({
    start: null,
    points: [],
    name: '',
    color: COLORS[0],
  });
  const [areas, setAreas] = useState([]);

  const handleDrawArea = () => {
    setDrawingMode(!drawingMode);
  };

  const handleMarkerPress = (index) => {
    if (drawingMode && index !== 0) {
      const newAreaPoints = [...area.points];
      newAreaPoints.splice(index, 1);
      setArea({ ...area, points: newAreaPoints });
    }
  };

  const handleMarkerDrag = (coordinate, index) => {
    if (drawingMode) {
      const newAreaPoints = [...area.points];
      if (index === 0) {
        setArea({ ...area, start: coordinate, points: newAreaPoints });
      } else {
        newAreaPoints[index] = coordinate;
        setArea({ ...area, points: newAreaPoints });
      }
    }
  };

  const handleMapPress = ({ nativeEvent: { coordinate } }) => {
    if (drawingMode) {
      if (!area.start) {
        setArea({ ...area, start: coordinate, points: [coordinate] });
      } else {
        const newAreaPoints = [...area.points];
        newAreaPoints.push(coordinate);
        setArea({ ...area, points: newAreaPoints });
      }
    }
  };

  const handleClearArea = () => {
    setArea({ ...area, start: null, points: [] });
  };

  const handleSaveArea = () => {
    if (area.points.length >= 3 && area.name !== '') {
      const newArea = {
        name: area.name,
        points: area.points,
        color: area.color,
      };

      setAreas([...areas, newArea]);
      setArea({ start: null, points: [], name: '', color: COLORS[0] });
      setDrawingMode(false);
    }
  };

  const handleEditArea = (index) => {
    const selectedArea = areas[index];
    setArea({
      start: null,
      points: selectedArea.points,
      name: selectedArea.name,
      color: selectedArea.color,
    });
    setDrawingMode(true);
    setAreas(areas.filter((_, i) => i !== index));
  };

  const handleTurnOnRobot = () => {
    // Lógica para ligar o robô
    // Adicione aqui a lógica para enviar os comandos para o robô através da placa ESP32
  };

  const handleTurnOffRobot = () => {
    // Lógica para desligar o robô
    // Adicione aqui a lógica para enviar os comandos para o robô através da placa ESP32
  };

  const handleGoToBase = () => {
    // Lógica para fazer o robô voltar à base
    // Adicione aqui a lógica para enviar os comandos para o robô através da placa ESP32
  };

  return (
    <View style={styles.container}>
      <Animatable.View animation="fadeInLeft" duration={500} style={styles.sidebar}>
        <TouchableOpacity onPress={handleDrawArea} style={styles.button}>
          <Text style={styles.buttonText}>{drawingMode ? 'Concluir Área' : 'Desenhar Área'}</Text>
        </TouchableOpacity>
        {drawingMode && (
          <>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={handleClearArea}>
              <Text style={styles.buttonText}>Limpar Área</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Nome da Área:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome da área"
              value={area.name}
              onChangeText={(text) => setArea({ ...area, name: text })}
            />
            <Text style={styles.label}>Cor da Área:</Text>
            <View style={styles.colorPalette}>
              {COLORS.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                  onPress={() => setArea({ ...area, color })}
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
          {area.start && (
            <Marker
              coordinate={area.start}
              draggable={true}
              onDrag={(e) => handleMarkerDrag(e.nativeEvent.coordinate, 0)}
            />
          )}
          {area.points.map((point, index) => (
            <Marker
              key={index}
              coordinate={point}
              onPress={() => handleMarkerPress(index + 1)}
              draggable={true}
              onDrag={(e) => handleMarkerDrag(e.nativeEvent.coordinate, index + 1)}
            />
          ))}
          {area.points.length >= 3 && (
            <Polygon
              coordinates={area.points}
              strokeColor={area.color}
              fillColor={area.color + '40'} // Adiciona transparência (alfa) à cor
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