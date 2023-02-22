import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView, Alert, Pressable, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons'; 
import { useEffect, useState } from 'react';
import { theme } from './colors';

// 코드 챌린지
// 마지막 모드 창을 기억하기 (완)
// 투두 누르면 완료한 창 만들기 (done / undone) (완)
// 투두 수정 버튼 만들기 (완)

const STORAGE_KEY = "@ToDos"
const MODE_KEY = "@working"

// 버튼
// TouchableHighlight 누르면 배경 색이 바뀌었다가 다시 원상복구
// TouchableOpacity 누르면 흐려졌다가 다시 원상복구
// TouchableWithoutFeedback UI의 변화 없음 > 콘솔에는 뜸
// pressable 미래에 살아남을 확률이 높은... 친구 TouchableOpacity 는 사라질지도 몰라...

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [ToDos, setToDos] = useState({});
  const [done, setDone] = useState(false);
  // react JS 에서 직접 수정은 금지 무조건 set__ 을 사용해야 함

  const travel = () => {
    setWorking(false);
    saveMode(false);
  };

  const work = () => { 
    setWorking(true);
    saveMode(true);
  }

  const onChangeText = (payload) => setText(payload);

  const saveMode = async (mode) => {
    await AsyncStorage.setItem(MODE_KEY, JSON.stringify(mode))
  }

  const loadMode = async () => {
    const m = await AsyncStorage.getItem(MODE_KEY);
    if (m == "true") {
      setWorking(true);
    } else {
      setWorking(false);
    }
  }

  const saveToDo = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  };

  const loadToDos = async () => {
    const s = await AsyncStorage.getItem(STORAGE_KEY);
    if (s) {
      setToDos(JSON.parse(s));
    }
  };

  useEffect(() => {
    loadToDos();
    loadMode();
  }, []);

  const addToDo = async () => {
    if (text === "") {
      return;
    }
    // const newToDos = Object.assign({}, ToDos, {[Date.now()]: {text, work: working}});
    const newToDos = {...ToDos, [Date.now()]: {text, working, done}};
    setToDos(newToDos);
    await saveToDo(newToDos);
    setText("");
    setDone(false);
  }

  const deleteToDo = (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = {...ToDos};
        delete newToDos[key];
        setToDos(newToDos);
        saveToDo(newToDos);
      }
    } else {
      Alert.alert(
        "Delete To Do",
        "Are you sure?", [
        {text: "Cancel"},
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: () => {
            const newToDos = {...ToDos};
            delete newToDos[key];
            setToDos(newToDos);
            saveToDo(newToDos);
          }}
      ]);
    }
  };

  const editToDo = (key) => {
    if (Platform.OS === "web") {
      const ok = prompt("투두를 수정해주세요", ``);
      if (ok == "") {
        alert("투두가 비어있어요! 다시 작성해주세요.");
      } else {
        const newToDos = {...ToDos};
        newToDos[key].text = editedText;
        setToDos(newToDos);
        saveToDo(newToDos);
      }
    } else {
      Alert.prompt(
        "Edit To Do",
        "투두리스트를 수정해주세요.", [
        {text: "Cancel"},
        {
          text: "Done",
          onPress: (editedText) => {
            if (editedText === "") {
              Alert.alert(
                "투두가 비어있어요!",
                "다시 작성해주세요."
              )
            } else {
              const newToDos = {...ToDos};
              newToDos[key].text = editedText;
              setToDos(newToDos);
              saveToDo(newToDos);
            }
          }
        }]
      )
    }
  };

  const doneToDo = (key) => {
    if (ToDos[key].done == false) {
      const newToDos = {...ToDos};
      newToDos[key].done = true;
      setToDos(newToDos);
      saveToDo(newToDos);
    } else {
      const newToDos = {...ToDos};
      newToDos[key].done = false;
      setToDos(newToDos);
      saveToDo(newToDos);
    }
    
  }
  
  return (
    <View style={{...styles.container, backgroundColor: working? theme.bg : theme.travel }}>
      <StatusBar style={working ? "inverted" : "dark"} />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{
            fontSize: 38,
            fontWeight: "500",
            color: working ? "white" : theme.lightGrey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{
            fontSize: 38,
            fontWeight: "500",
            color: !working ? theme.green : theme.grey}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          onSubmitEditing={addToDo}
          returnKeyType="done"
          placeholder={working ? "Add a To Do" : "Where do you want to go?"}
          style={working? styles.input : styles.travelInput} />
      </View>
      <ScrollView>
        {Object.keys(ToDos).map((key) =>
          ToDos[key].working === working ? (
          <View
            style={ working ? styles.toDo : styles.travelToDo }
            key={key}
          >
            <Pressable onPress={() => doneToDo(key)} hitSlop={10}>
              <Text style={{...styles.toDoText,
                color: working ? "#fff" : theme.green,
                textDecorationLine: ToDos[key].done ? "line-through" : "none",
              }}>
                {ToDos[key].text}
              </Text>
            </Pressable>
            <View style={{flexDirection: "row"}}>
              <TouchableOpacity onPress={() => editToDo(key)}>
                <FontAwesome5 name="edit" size={17} color={ working ? theme.toDoBg : theme.green } style={styles.edit} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteToDo(key)}>
                <FontAwesome5 name="trash-alt" size={17} color={ working ? theme.toDoBg : theme.green } />
              </TouchableOpacity>
            </View>
          </View>
          ):(
            null
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 17,
  },
  travelInput: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 17,
    borderStyle: 'solid',
    borderColor: theme.green,
    borderWidth: 2,
  },
  toDo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between",
  },
  travelToDo: {
    backgroundColor: "#fff",
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between",
    borderStyle: 'solid',
    borderColor: theme.green,
    borderWidth: 2,
  },
  toDoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  edit: {
    marginRight: 8,
  }
});
