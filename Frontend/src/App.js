import React from "react";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import TaskList from "./component/TaskList";
import Navbar from "./component/Navbar";
import Header from "./component/Header";


function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <Navbar />
        {/* <Header /> */}
        <TaskList />
      </div>
    </ApolloProvider>
  );
}


export default App;










// import React from "react";
// import TaskList from "./component/TaskList";
// import Header from "./component/Header";
// import Dashboard from "./component/Dashboard";

// function App(){
//   return(
//     <div>
//       <Header/>
//       <Dashboard/>
//       <TaskList/>
//     </div>
//   );
// }

// export default App;



// import React from "react";
// import TaskList from "./component/TaskList";

// function App(){
//   return(
//     <div>
//       <h1>Task Management</h1>
//       <TaskList/>
//     </div>
//   );
// }

// export default App;