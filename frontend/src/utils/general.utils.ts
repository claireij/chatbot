export const getCurrentDate = () => {
    const current = new Date();
    const current_date = `${current.getDate()}.${
      current.getMonth() + 1
    }.${current.getFullYear()}  ${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}`;

    return current_date
}