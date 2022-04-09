export async function balanceOf(contract: any, address: string) {
  let balance = await contract.balanceOf(address);
  return balance.toString();
}