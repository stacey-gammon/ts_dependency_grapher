| Node | Old parent | New parent | description | 
|----|----|
| _common_mocks_ts | _common | _server | Node's only connections are with nodes within _server.  |
| _public_bootstrap_ts | _public | _public_lib_triggers | Connections with new parent, (_public_lib_triggers:_public_lib_triggers_triggers_ts:36), is strong than with current parent (2), and subtracting the sum of all other parent connections, (_public:_public_plugin_tsx:2), exceeds move threshold of 0. 36 - 2 > 0  |
| _public_lib_types_ts | _public_lib | _common | Node's only connections are with nodes within _common.  |
| _public_lib_containers_i_container_ts | _public_lib_containers | _public_lib_embeddables | Node's only connections are with nodes within _public_lib_embeddables.  |
| _public_lib_embeddables_default_embeddable_factory_provider_ts | _public_lib_embeddables | _public | Node's only connections are with nodes within _public.  |
| _public_lib_state_transfer_embeddable_state_transfer_ts | _public_lib_state_transfer | _public | Connections with new parent, (_public:_public_plugin_tsx:24)(_public:_public_index_ts:4)(_public:_public_mocks_tsx:12), is strong than with current parent (18), and subtracting the sum of all other parent connections, (_public_lib_state_transfer:_public_lib_state_transfer_index_ts:4)(_public_lib_actions:_public_lib_actions_edit_panel_action_ts:8)(_public_lib_panel:_public_lib_panel_embeddable_panel_tsx:8)(_public_lib_state_transfer:_public_lib_state_transfer_types_ts:14), exceeds move threshold of 0. 40 - 34 > 0  |
| _public_lib_test_samples_actions | _public_lib_test_samples | _public_lib_embeddables | Connections with new parent, (_public_lib_embeddables:_public_lib_embeddables_embeddable_tsx:24), is strong than with current parent (0), and subtracting the sum of all other parent connections, (_common:_common_types_ts:10)(_Users_gammon_Elastic:_Users_gammon_Elastic_kibana:8), exceeds move threshold of 0. 24 - 18 > 0  |
| _public_tests_test_plugin_ts | _public_tests | _public | Node's only connections are with nodes within _public.  |
| _server_plugin_ts | _server | _common_lib | Connections with new parent, (_common_lib:_common_lib_extract_ts:9)(_common_lib:_common_lib_inject_ts:9)(_common_lib:_common_lib_migrate_ts:6)(_common_lib:_common_lib_telemetry_ts:9)(_common_lib:_common_lib_get_all_migrations_ts:3), is strong than with current parent (2), and subtracting the sum of all other parent connections, (_server:_server_index_ts:2), exceeds move threshold of 0. 36 - 2 > 0  |
| _common_types_ts | _common | _public_lib_panel | Connections with new parent, (_public_lib_panel:_public_lib_panel_panel_header:30)(_public_lib_panel:_public_lib_panel_embeddable_panel_tsx:30), is strong than with current parent (5), and subtracting the sum of all other parent connections, (_common:_public_lib_types_ts:5)(_public_lib_actions:_public_lib_actions_edit_panel_action_ts:10)(_public:_public_index_ts:5)(_public_lib_test_samples:_public_lib_test_samples_embeddables:15)(_public_lib_embeddables:_public_lib_test_samples_actions:10)(_public_lib_embeddables:_public_lib_embeddables_embeddable_tsx:10), exceeds move threshold of 0. 60 - 55 > 0  |
| _public_lib_state_transfer_index_ts | _public_lib_state_transfer | _public | Node's only connections are with nodes within _public.  |
| _public_lib_test_samples_embeddables | _public_lib_test_samples | _public_lib_containers | Connections with new parent, (_public_lib_containers:_public_lib_containers_container_ts:60)(_public_lib_containers:_public_lib_containers_embeddable_child_panel_tsx:8), is strong than with current parent (0), and subtracting the sum of all other parent connections, (_public_lib_panel:_common_types_ts:15)(_public_lib_embeddables:_public_lib_embeddables_embeddable_tsx:24), exceeds move threshold of 0. 68 - 39 > 0  |
| _public_lib_state_transfer_types_ts | _public_lib_state_transfer | _public | Node's only connections are with nodes within _public.  |