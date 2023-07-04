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
  const [manualMode, setManualMode] = useState(false);

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

  const handleToggleWaterPumps = () => {
    // Lógica para ligar/desligar as bombas d'água do robô
    // Adicione aqui a lógica para enviar os comandos para o robô através da placa ESP32
  };

  const handleMoveRobot = (direction) => {
    // Lógica para mover o robô
    // Adicione aqui a lógica para enviar os comandos para o robô através da placa ESP32
  };

  const handleJoystickMove = (x, y) => {
    // Lógica para controlar o robô usando o joystick
    // 'x' e 'y' representam a posição do joystick (-1 a 1)
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
        {!manualMode ? (
          <TouchableOpacity style={[styles.button, { backgroundColor: '#f1c40f' }]} onPress={() => setManualMode(true)}>
            <Text style={styles.buttonText}>Controlar Manualmente</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.joystickContainer}>
            <View style={styles.joystick}>
              <TouchableOpacity
                style={styles.joystickButton}
                onPress={() => handleMoveRobot('forward')}
              ></TouchableOpacity>
              <View style={styles.joystickAxis}>
                <TouchableOpacity
                  style={styles.joystickButton}
                  onPress={() => handleMoveRobot('left')}
                ></TouchableOpacity>
                <View style={styles.joystickCenter}>
                  <TouchableOpacity
                    style={styles.joystickButton}
                    onPress={() => handleMoveRobot('stop')}
                  ></TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.joystickButton}
                  onPress={() => handleMoveRobot('right')}
                ></TouchableOpacity>
              </View>
              <TouchableOpacity
                style={styles.joystickButton}
                onPress={() => handleMoveRobot('backward')}
              ></TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#e74c3c' }]}
              onPress={() => setManualMode(false)}
            >
              <Text style={styles.buttonText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity style={[styles.button, { backgroundColor: '#27ae60' }]} onPress={handleTurnOnRobot}>
          <Text style={styles.buttonText}>Ligar Robô</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#e74c3c' }]} onPress={handleTurnOffRobot}>
          <Text style={styles.buttonText}>Desligar Robô</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#3498db' }]} onPress={handleToggleWaterPumps}>
          <Text style={styles.buttonText}>Ligar/Desligar Bombas d'Água</Text>
        </TouchableOpacity>
      </Animatable.View>
      <MapView
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: -15.619886,
          longitude: -47.650523,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        mapType="hybrid" // Set mapType to "satellite"
      >
        {areas.map((item, index) => (
          <Polygon
            key={index}
            coordinates={item.points}
            strokeColor="#2c3e50"
            fillColor={item.color}
            strokeWidth={2}
          />
        ))}
        {area.start && (
          <>
            <Marker
              coordinate={area.start}
              title={area.name}
              pinColor={area.color}
              draggable={true}
              onDrag={(e) => handleMarkerDrag(e.nativeEvent.coordinate, 0)}
            />
            {area.points.map((point, index) => (
              <Marker
                key={index + 1}
                coordinate={point}
                pinColor={area.color}
                draggable={true}
                onDrag={(e) => handleMarkerDrag(e.nativeEvent.coordinate, index + 1)}
                onPress={() => handleMarkerPress(index + 1)}
              />
            ))}
          </>
        )}
      </MapView>
    </View>
  );
};

const joystickSize = 150;
const joystickButtonSize = 50;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    marginRight: 5,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  areaItem: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 4,
    marginBottom: 5,
  },
  areaItemText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  joystickContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  joystick: {
    width: joystickSize,
    height: joystickSize,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: joystickSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickAxis: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  joystickButton: {
    width: joystickButtonSize,
    height: joystickButtonSize,
    backgroundColor: '#2c3e50',
    borderRadius: joystickButtonSize / 2,
    position: 'absolute',
  },
  joystickCenter: {
    width: joystickButtonSize,
    height: joystickButtonSize,
    backgroundColor: '#e74c3c',
    borderRadius: joystickButtonSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 4,
  },
});

export default App;
