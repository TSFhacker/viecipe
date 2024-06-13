export function timeAgo(date) {
  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  if (secondsPast < 60) {
    return `${Math.floor(secondsPast)} giây trước`;
  }
  if (secondsPast < 3600) {
    return `${Math.floor(secondsPast / 60)} phút trước`;
  }
  if (secondsPast <= 86400) {
    return `${Math.floor(secondsPast / 3600)} giờ trước`;
  }
  if (secondsPast < 2592000) {
    return `${Math.floor(secondsPast / 86400)} ngày trước`;
  }
  if (secondsPast < 31536000) {
    return `${Math.floor(secondsPast / 2592000)} tháng trước`;
  }
  return `${Math.floor(secondsPast / 31536000)} năm trước`;
}
