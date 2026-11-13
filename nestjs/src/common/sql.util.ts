// Dấu % và _ trong ô tìm kiếm là ký tự đặc biệt của LIKE: người dùng gõ "50%" hay "a_b" phải được hiểu là chữ thường, không phải ký tự đại diện
export const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`)
