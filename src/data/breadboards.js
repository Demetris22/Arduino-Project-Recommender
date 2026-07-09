// Declarative breadboard wiring specs, one per project id, rendered by
// <Breadboard>. Kept OUT of projects.json (that file is the engine's data and
// must not change) — this is presentation only.
//
// A spec is: { board, pins[], parts[], wires[] }
//   pins:  { id, type }        type = pwr | gnd | dig | ana | clk  (pad colour)
//   parts: { id, type, ... }   type = led | rgb-led | resistor | photoresistor
//                              | push-button | potentiometer | buzzer | module
//                              module also needs { name, pins:[...] }
//   wires: { from, to, color } endpoints are a pin id ("D7") or "<partId>.<pin>"
//                              color = red|blk|grn|blu|yel|org|pur|wht|tea
//
// Pin/anchor names per part type:
//   led            anode, cathode        rgb-led   common, r, g, b
//   resistor       a, b                  photoresistor  a, b
//   push-button    a, b                  potentiometer  t1, wiper, t2
//   buzzer         plus, minus           module         <its declared pins>
//
// Projects r4-led-matrix-smiley / -scroll have no external wiring (the matrix is
// on the board), so they are intentionally absent.

export const BREADBOARDS = {
  'blink-led': {
    board: 'UNO',
    pins: [
      { id: 'D7', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'r1', type: 'resistor', label: '220Ω' },
      { id: 'd1', type: 'led', color: '#e6413a' },
    ],
    wires: [
      { from: 'D7', to: 'r1.a', color: 'grn' },
      { from: 'r1.b', to: 'd1.anode', color: 'org' },
      { from: 'd1.cathode', to: 'GND', color: 'blk' },
    ],
  },

  'button-controlled-led': {
    board: 'UNO',
    pins: [
      { id: 'D2', type: 'dig' },
      { id: 'D7', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'b1', type: 'push-button' },
      { id: 'r1', type: 'resistor', label: '220Ω' },
      { id: 'd1', type: 'led', color: '#e6413a' },
    ],
    wires: [
      { from: 'D2', to: 'b1.a', color: 'blu' },
      { from: 'b1.b', to: 'GND', color: 'blk' },
      { from: 'D7', to: 'r1.a', color: 'grn' },
      { from: 'r1.b', to: 'd1.anode', color: 'org' },
      { from: 'd1.cathode', to: 'GND', color: 'blk' },
    ],
  },

  'potentiometer-dimmer': {
    board: 'UNO',
    pins: [
      { id: '5V', type: 'pwr' },
      { id: 'A0', type: 'ana' },
      { id: 'D9', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'p1', type: 'potentiometer' },
      { id: 'r1', type: 'resistor', label: '220Ω' },
      { id: 'd1', type: 'led', color: '#e6413a' },
    ],
    wires: [
      { from: '5V', to: 'p1.t1', color: 'red' },
      { from: 'p1.t2', to: 'GND', color: 'blk' },
      { from: 'p1.wiper', to: 'A0', color: 'blu' },
      { from: 'D9', to: 'r1.a', color: 'grn' },
      { from: 'r1.b', to: 'd1.anode', color: 'org' },
      { from: 'd1.cathode', to: 'GND', color: 'blk' },
    ],
  },

  'light-sensor-nightlight': {
    board: 'UNO',
    pins: [
      { id: '5V', type: 'pwr' },
      { id: 'A0', type: 'ana' },
      { id: 'D7', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'ph1', type: 'photoresistor' },
      { id: 'r1', type: 'resistor', label: '10kΩ' },
      { id: 'r2', type: 'resistor', label: '220Ω' },
      { id: 'd1', type: 'led', color: '#e6413a' },
    ],
    wires: [
      { from: '5V', to: 'ph1.a', color: 'red' },
      { from: 'ph1.b', to: 'A0', color: 'blu' },
      { from: 'ph1.b', to: 'r1.a', color: 'blu' },
      { from: 'r1.b', to: 'GND', color: 'blk' },
      { from: 'D7', to: 'r2.a', color: 'grn' },
      { from: 'r2.b', to: 'd1.anode', color: 'org' },
      { from: 'd1.cathode', to: 'GND', color: 'blk' },
    ],
  },

  'rgb-mood-lamp': {
    board: 'UNO',
    pins: [
      { id: 'D9', type: 'dig' },
      { id: 'D10', type: 'dig' },
      { id: 'D11', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'rgb1', type: 'rgb-led' },
      { id: 'r1', type: 'resistor', label: '220Ω' },
      { id: 'r2', type: 'resistor', label: '220Ω' },
      { id: 'r3', type: 'resistor', label: '220Ω' },
    ],
    wires: [
      { from: 'rgb1.common', to: 'GND', color: 'blk' },
      { from: 'D9', to: 'r1.a', color: 'red' },
      { from: 'r1.b', to: 'rgb1.r', color: 'red' },
      { from: 'D10', to: 'r2.a', color: 'grn' },
      { from: 'r2.b', to: 'rgb1.g', color: 'grn' },
      { from: 'D11', to: 'r3.a', color: 'blu' },
      { from: 'r3.b', to: 'rgb1.b', color: 'blu' },
    ],
  },

  'piezo-melody': {
    board: 'UNO',
    pins: [
      { id: 'D8', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [{ id: 'bz1', type: 'buzzer' }],
    wires: [
      { from: 'D8', to: 'bz1.plus', color: 'org' },
      { from: 'bz1.minus', to: 'GND', color: 'blk' },
    ],
  },

  'ultrasonic-parking-sensor': {
    board: 'UNO',
    pins: [
      { id: '5V', type: 'pwr' },
      { id: 'D7', type: 'dig' },
      { id: 'D8', type: 'dig' },
      { id: 'D9', type: 'dig' },
      { id: 'D10', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'u1', type: 'module', name: 'HC-SR04', pins: ['VCC', 'Trig', 'Echo', 'GND'] },
      { id: 'bz1', type: 'buzzer' },
      { id: 'r1', type: 'resistor', label: '220Ω' },
      { id: 'd1', type: 'led', color: '#e6413a' },
    ],
    wires: [
      { from: '5V', to: 'u1.VCC', color: 'red' },
      { from: 'u1.GND', to: 'GND', color: 'blk' },
      { from: 'D9', to: 'u1.Trig', color: 'yel' },
      { from: 'D10', to: 'u1.Echo', color: 'grn' },
      { from: 'D8', to: 'bz1.plus', color: 'org' },
      { from: 'bz1.minus', to: 'GND', color: 'blk' },
      { from: 'D7', to: 'r1.a', color: 'blu' },
      { from: 'r1.b', to: 'd1.anode', color: 'blu' },
      { from: 'd1.cathode', to: 'GND', color: 'blk' },
    ],
  },

  'servo-sweep': {
    board: 'UNO',
    pins: [
      { id: '5V', type: 'pwr' },
      { id: 'D9', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [{ id: 's1', type: 'module', name: 'SERVO', pins: ['SIG', 'VCC', 'GND'] }],
    wires: [
      { from: 'D9', to: 's1.SIG', color: 'org' },
      { from: '5V', to: 's1.VCC', color: 'red' },
      { from: 's1.GND', to: 'GND', color: 'blk' },
    ],
  },

  'temp-humidity-lcd': {
    board: 'UNO',
    pins: [
      { id: '5V', type: 'pwr' },
      { id: 'D2', type: 'dig' },
      { id: 'A4', type: 'ana' },
      { id: 'A5', type: 'ana' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'u1', type: 'module', name: 'DHT11', pins: ['VCC', 'DATA', 'GND'] },
      { id: 'u2', type: 'module', name: 'LCD I2C', pins: ['GND', 'VCC', 'SDA', 'SCL'] },
    ],
    wires: [
      { from: '5V', to: 'u1.VCC', color: 'red' },
      { from: 'u1.GND', to: 'GND', color: 'blk' },
      { from: 'D2', to: 'u1.DATA', color: 'grn' },
      { from: '5V', to: 'u2.VCC', color: 'red' },
      { from: 'u2.GND', to: 'GND', color: 'blk' },
      { from: 'A4', to: 'u2.SDA', color: 'blu' },
      { from: 'A5', to: 'u2.SCL', color: 'yel' },
    ],
  },

  'motion-activated-alarm': {
    board: 'UNO',
    pins: [
      { id: '5V', type: 'pwr' },
      { id: 'D2', type: 'dig' },
      { id: 'D7', type: 'dig' },
      { id: 'D8', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'u1', type: 'module', name: 'PIR', pins: ['VCC', 'OUT', 'GND'] },
      { id: 'bz1', type: 'buzzer' },
      { id: 'r1', type: 'resistor', label: '220Ω' },
      { id: 'd1', type: 'led', color: '#e6413a' },
    ],
    wires: [
      { from: '5V', to: 'u1.VCC', color: 'red' },
      { from: 'u1.GND', to: 'GND', color: 'blk' },
      { from: 'D2', to: 'u1.OUT', color: 'grn' },
      { from: 'D8', to: 'bz1.plus', color: 'org' },
      { from: 'bz1.minus', to: 'GND', color: 'blk' },
      { from: 'D7', to: 'r1.a', color: 'blu' },
      { from: 'r1.b', to: 'd1.anode', color: 'blu' },
      { from: 'd1.cathode', to: 'GND', color: 'blk' },
    ],
  },

  'reaction-time-game': {
    board: 'UNO',
    pins: [
      { id: 'D2', type: 'dig' },
      { id: 'D7', type: 'dig' },
      { id: 'D8', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'b1', type: 'push-button' },
      { id: 'r1', type: 'resistor', label: '220Ω' },
      { id: 'd1', type: 'led', color: '#e6413a' },
      { id: 'bz1', type: 'buzzer' },
    ],
    wires: [
      { from: 'D2', to: 'b1.a', color: 'blu' },
      { from: 'b1.b', to: 'GND', color: 'blk' },
      { from: 'D7', to: 'r1.a', color: 'grn' },
      { from: 'r1.b', to: 'd1.anode', color: 'org' },
      { from: 'd1.cathode', to: 'GND', color: 'blk' },
      { from: 'D8', to: 'bz1.plus', color: 'yel' },
      { from: 'bz1.minus', to: 'GND', color: 'blk' },
    ],
  },

  'distance-display': {
    board: 'UNO',
    pins: [
      { id: '5V', type: 'pwr' },
      { id: 'D9', type: 'dig' },
      { id: 'D10', type: 'dig' },
      { id: 'A4', type: 'ana' },
      { id: 'A5', type: 'ana' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'u1', type: 'module', name: 'HC-SR04', pins: ['VCC', 'Trig', 'Echo', 'GND'] },
      { id: 'u2', type: 'module', name: 'LCD I2C', pins: ['GND', 'VCC', 'SDA', 'SCL'] },
    ],
    wires: [
      { from: '5V', to: 'u1.VCC', color: 'red' },
      { from: 'u1.GND', to: 'GND', color: 'blk' },
      { from: 'D9', to: 'u1.Trig', color: 'yel' },
      { from: 'D10', to: 'u1.Echo', color: 'grn' },
      { from: '5V', to: 'u2.VCC', color: 'red' },
      { from: 'u2.GND', to: 'GND', color: 'blk' },
      { from: 'A4', to: 'u2.SDA', color: 'blu' },
      { from: 'A5', to: 'u2.SCL', color: 'pur' },
    ],
  },

  'smart-servo-door': {
    board: 'UNO',
    pins: [
      { id: '5V', type: 'pwr' },
      { id: 'D2', type: 'dig' },
      { id: 'D9', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'u1', type: 'module', name: 'PIR', pins: ['VCC', 'OUT', 'GND'] },
      { id: 's1', type: 'module', name: 'SERVO', pins: ['SIG', 'VCC', 'GND'] },
    ],
    wires: [
      { from: '5V', to: 'u1.VCC', color: 'red' },
      { from: 'u1.GND', to: 'GND', color: 'blk' },
      { from: 'D2', to: 'u1.OUT', color: 'grn' },
      { from: 'D9', to: 's1.SIG', color: 'org' },
      { from: '5V', to: 's1.VCC', color: 'red' },
      { from: 's1.GND', to: 'GND', color: 'blk' },
    ],
  },

  'wifi-weather-logger': {
    board: 'ESP32',
    pins: [
      { id: '3V3', type: 'pwr' },
      { id: 'GPIO4', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [{ id: 'u1', type: 'module', name: 'DHT11', pins: ['VCC', 'DATA', 'GND'] }],
    wires: [
      { from: '3V3', to: 'u1.VCC', color: 'red' },
      { from: 'u1.GND', to: 'GND', color: 'blk' },
      { from: 'GPIO4', to: 'u1.DATA', color: 'grn' },
    ],
  },

  'iot-led-control': {
    board: 'ESP32',
    pins: [
      { id: 'GPIO2', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'r1', type: 'resistor', label: '220Ω' },
      { id: 'd1', type: 'led', color: '#e6413a' },
    ],
    wires: [
      { from: 'GPIO2', to: 'r1.a', color: 'grn' },
      { from: 'r1.b', to: 'd1.anode', color: 'org' },
      { from: 'd1.cathode', to: 'GND', color: 'blk' },
    ],
  },

  'r4-dac-waveform': {
    board: 'UNO R4',
    pins: [
      { id: 'A0', type: 'ana' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [{ id: 'bz1', type: 'buzzer' }],
    wires: [
      { from: 'A0', to: 'bz1.plus', color: 'org' },
      { from: 'bz1.minus', to: 'GND', color: 'blk' },
    ],
  },

  'r4-distance-matrix': {
    board: 'UNO R4',
    pins: [
      { id: '5V', type: 'pwr' },
      { id: 'D9', type: 'dig' },
      { id: 'D10', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [{ id: 'u1', type: 'module', name: 'HC-SR04', pins: ['VCC', 'Trig', 'Echo', 'GND'] }],
    wires: [
      { from: '5V', to: 'u1.VCC', color: 'red' },
      { from: 'u1.GND', to: 'GND', color: 'blk' },
      { from: 'D9', to: 'u1.Trig', color: 'yel' },
      { from: 'D10', to: 'u1.Echo', color: 'grn' },
    ],
  },

  'r4-wifi-web-led': {
    board: 'UNO R4',
    pins: [
      { id: 'D7', type: 'dig' },
      { id: 'GND', type: 'gnd' },
    ],
    parts: [
      { id: 'r1', type: 'resistor', label: '220Ω' },
      { id: 'd1', type: 'led', color: '#e6413a' },
    ],
    wires: [
      { from: 'D7', to: 'r1.a', color: 'grn' },
      { from: 'r1.b', to: 'd1.anode', color: 'org' },
      { from: 'd1.cathode', to: 'GND', color: 'blk' },
    ],
  },
};

export default BREADBOARDS;
