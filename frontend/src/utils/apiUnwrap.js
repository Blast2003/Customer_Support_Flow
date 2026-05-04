export function unwrapApiData(res) {
  return res?.data?.data ?? res?.data ?? res;
}