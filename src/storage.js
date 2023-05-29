export const saveData = data => {
  localStorage.setItem('data', JSON.stringify(data));
}
export const loadData = () => {
  return JSON.parse(localStorage.getItem('data'));
}