import Scene from "./components/Scene";

function App() {
  return (
    <div className="h-screen bg-stone-200 flex justify-center items-center relative">
      <div className="h-full w-full text-stone-200 flex justify-center text-9xl font-extrabold items-center">
        Generic
      </div>
      <Scene />
    </div>
  );
}

export default App;
