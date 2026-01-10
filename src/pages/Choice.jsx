export default function Choice({ setMode }) {
  return (
    <div>
      <h1>What do you want to calculate?</h1>

      <button onClick={() => setMode("INDIVIDUAL")}>
        Individual (Personal Income Tax)
      </button>

      <br /><br />

      <button onClick={() => setMode("LLC")}>
        Business / LLC
      </button>
    </div>
  );
}
