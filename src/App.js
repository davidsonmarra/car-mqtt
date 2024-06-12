import React, { useState, useEffect } from "react";
import mqtt from "mqtt";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`;

const Title = styled.h1`
  color: #333;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const ButtonOn = styled.button`
  background-color: #007b00;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #005600;
  }
`;

const ButtonOff = styled.button`
  background-color: #ff3245;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #ff3200;
  }
`;

const DirectionButtons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DirectionButton = styled(Button)`
  width: 100px;
`;

const Speedometer = styled.p`
  font-size: 24px;
  font-weight: bold;
  color: #e2e2e2;
  background-color: #333;
  width: 80px;
  padding: 12px 16px;
  margin: auto;
  border-radius: 10px;
`;

const MQTT_SERVER = "ws://test.mosquitto.org:8080/mqtt"; // Use WebSocket URL of your MQTT broker
const MQTT_TOPIC_LED = "home/led";
const MQTT_TOPIC_BUZZER = "home/buzzer";
const MQTT_TOPIC_SPEED = "home/speed"; // Tópico para a velocidade

function App() {
  const [client, setClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [speed, setSpeed] = useState(0); // Estado para armazenar a velocidade

  useEffect(() => {
    const mqttClient = mqtt.connect(MQTT_SERVER);

    mqttClient.on("connect", () => {
      console.log("Connected to MQTT broker");
      setConnected(true);
      mqttClient.subscribe(MQTT_TOPIC_SPEED); // Assina o tópico de velocidade quando conectado
    });

    mqttClient.on("error", (err) => {
      console.error("Connection error: ", err);
      mqttClient.end();
    });

    mqttClient.on("close", () => {
      console.log("Disconnected from MQTT broker");
      setConnected(false);
    });

    mqttClient.on("message", (topic, message) => {
      // Atualiza a velocidade quando a mensagem do tópico de velocidade é recebida
      if (topic === MQTT_TOPIC_SPEED) {
        setSpeed(parseInt(message.toString()));
      }
    });

    setClient(mqttClient);

    return () => {
      if (mqttClient) {
        mqttClient.end();
      }
    };
  }, []);

  const sendCommand = (topic, message) => {
    if (client && connected) {
      client.publish(topic, message);
      console.log(`Published ${message} to ${topic}`);
    } else {
      console.log("MQTT client is not connected");
    }
  };

  return (
    <Container className="App">
      <header className="App-header">
        <Title>MQTT Car Controller</Title>
        {!connected ? (
          <button onClick={() => setConnected(true)}>Connect to MQTT</button>
        ) : (
          <div>
            <h2>LED Control</h2>
            <DirectionButtons>
              <ButtonOn onClick={() => sendCommand(MQTT_TOPIC_LED, "on")}>
                Turn LED On
              </ButtonOn>
              <ButtonOff onClick={() => sendCommand(MQTT_TOPIC_LED, "off")}>
                Turn LED Off
              </ButtonOff>
            </DirectionButtons>
            <h2>Buzzer Control</h2>
            <DirectionButtons>
              <ButtonOn onClick={() => sendCommand(MQTT_TOPIC_BUZZER, "off")}>
                Turn Buzzer On
              </ButtonOn>
              <ButtonOff onClick={() => sendCommand(MQTT_TOPIC_BUZZER, "on")}>
                Turn Buzzer Off
              </ButtonOff>
            </DirectionButtons>
            <div>
              <h2>Speed</h2>
              <Speedometer>{speed} RPM</Speedometer>
              {/* Exibe a velocidade em tempo real */}
            </div>
          </div>
        )}
      </header>
    </Container>
  );
}

export default App;
