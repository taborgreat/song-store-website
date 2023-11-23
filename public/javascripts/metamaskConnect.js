export function connectWallet() {
  if (window.ethereum) {
    let account;
    ethereum.request({ method: "eth_requestAccounts" }).then((accounts) => {
      account = accounts[0];
      console.log(account);
    });
  } else {
    console.log("install metamask");
  }
}
