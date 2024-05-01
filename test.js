async function ttt() {
  return '1';
}

(async () => {
  global.a = await ttt();
})();
console.log(global.a);
